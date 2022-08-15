import {CfnOutput, Fn, Stack, StackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {CfnSecurityGroup} from "aws-cdk-lib/aws-ec2";

export class SecurityGroupStack extends Stack {

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const albSg = new CfnSecurityGroup(
            this,
            'spin-off-alb-sg',
            {
                groupDescription: 'alb-sg', // 보안그룹 설명
                groupName: 'spin-off-alb-sg', // 보안그룹 이름
                vpcId: Fn.importValue('vpc-id'), // Fn.importValue -> 다른 스택에서 내보낸 출력 값 반환
                securityGroupIngress: [{
                    ipProtocol: 'tcp',
                    cidrIp: '0.0.0.0/0',
                    fromPort: 443,
                    toPort: 443,
                }, {
                    ipProtocol: 'tcp',
                    cidrIp: '0.0.0.0/0',
                    fromPort: 80,
                    toPort: 80,
                }],
            }
        );

        // Create Bastion Sg
        const bastionSg = new CfnSecurityGroup(
            this,
            'spin-off-bastion-sg',
            {
                groupDescription: 'bastion-sg',
                groupName: 'spin-off-bastion-sg',
                vpcId: Fn.importValue('vpc-id'),
                securityGroupIngress: [{
                    ipProtocol: 'tcp',
                    cidrIp: '0.0.0.0/0',
                    fromPort: 22,
                    toPort: 22,
                }]
            }
        );

        const rdsSg = new CfnSecurityGroup(
            this,
            'spin-off-RDS',
            {
                groupDescription: 'mysql-sg',
                groupName: 'spin-off-mysql-sg',
                vpcId: Fn.importValue('vpc-id'),
                securityGroupIngress: [{
                    ipProtocol: 'tcp',
                    sourceSecurityGroupId: bastionSg.ref,
                    fromPort: 3306,
                    toPort: 3306,
                }],
            }
        );

        new CfnOutput(
            this,
            "alb-sg", {
                value: albSg.ref,
                exportName: 'alb-sg',
            }
        );
        new CfnOutput(
            this,
            "bastion-sg", {
                value: bastionSg.ref,
                exportName: 'bastion-sg',
            }
        );
        new CfnOutput(
            this,
            "rds-sg", {
                value: rdsSg.ref,
                exportName: 'rds-sg',
            }
        );
    }
}