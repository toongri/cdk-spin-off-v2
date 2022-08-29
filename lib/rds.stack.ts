import {aws_rds, CfnOutput, Fn, Stack, StackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {StringParameter} from "aws-cdk-lib/aws-ssm";
import {
    CfnDBInstance,
    CfnDBParameterGroup,
    CfnDBSubnetGroup
} from "aws-cdk-lib/aws-rds";

export class RdsStack extends Stack {

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        //Pre-create required (AWS SSM)
        const ssmDbPassword = StringParameter.fromSecureStringParameterAttributes(
            this,
            'db-password',{
                version: 1,
                parameterName: 'db-password',
            }
        );
        const rds_password = ssmDbPassword.stringValue;

        // Create Subnet Group
        const rdsSubnetGroup = new CfnDBSubnetGroup(
            this,
            'spin-off-mariadb-subnet-group',{
                dbSubnetGroupDescription: 'mariadb subnet group',
                subnetIds: [
                    Fn.importValue('private-subnet-1-id'),
                    Fn.importValue('private-subnet-2-id')
                ],
                dbSubnetGroupName: 'spin-off-mariadb-subnet-group'
            }
        );

        const mariadbRdsParameter = new CfnDBParameterGroup(
            this,
            'spin-off-mariadb-parameter',{
                family: 'mariadb10.6',
                description: 'mariadb 10.6 parameter group',
                parameters: {
                    'character_set_server': 'utf8mb4',
                    'character_set_connection': 'utf8mb4',
                    'character_set_database': 'utf8mb4',
                    'character_set_filesystem': 'utf8mb4',
                    'character_set_results': 'utf8mb4',
                    'character_set_client': 'utf8mb4',
                    'collation_connection': 'utf8mb4_unicode_ci',
                    'collation_server': 'utf8mb4_unicode_ci',
                }
            }
        );

        const mariadbRdsInstance1 = new CfnDBInstance(
            this,
            'spin-off-mariadb', {
                dbInstanceClass: 'db.t3.micro',
                // associatedRoles: [{
                //     roleArn: 'arn:aws:iam::188744525043:role/aws-service-role/rds.amazonaws.com/AWSServiceRoleForRDS',
                //     featureName: 'rdsRole'
                // }, {
                //     roleArn: 'arn:aws:iam::188744525043:role/spin-off-ssm-rds-iam-role',
                //     featureName: 'ssmRole'
                // }],
                allocatedStorage: '20',
                // maxAllocatedStorage: 40,
                engine: 'mariadb',
                engineVersion: '10.6',
                backupRetentionPeriod: 7, // 자동 백업이 유지되는 일 수
                dbSubnetGroupName: 'spin-off-mariadb-subnet-group',
                dbParameterGroupName: mariadbRdsParameter.ref,
                dbInstanceIdentifier: 'spin-off-mariadb-instance',
                masterUsername: 'admin',
                masterUserPassword: rds_password,
                port: '3306',
                storageEncrypted: false,
                vpcSecurityGroups: [Fn.importValue('rds-sg')]
            }
        );

        // Create Dependency (Subnet -> Cluster -> Instance)
        mariadbRdsParameter.addDependsOn(rdsSubnetGroup);
        mariadbRdsInstance1.addDependsOn(mariadbRdsParameter);

        // output
        new CfnOutput(
            this,
            'rds-host', {
                value: mariadbRdsInstance1.attrEndpointAddress,
                exportName: 'rds-host'
            }
        );
    }
}