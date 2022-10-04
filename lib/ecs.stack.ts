import {Duration, Fn, Stack, StackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {SecurityGroup, Subnet, Vpc} from "aws-cdk-lib/aws-ec2";
import {ApplicationTargetGroup} from "aws-cdk-lib/aws-elasticloadbalancingv2";
import {Role} from "aws-cdk-lib/aws-iam";
import {StringParameter} from "aws-cdk-lib/aws-ssm";
import {
    Cluster,
    ContainerImage,
    FargateService,
    FargateTaskDefinition,
    LogDriver,
    Protocol,
    Secret
} from "aws-cdk-lib/aws-ecs";
import {Repository} from "aws-cdk-lib/aws-ecr";
import {LogGroup} from "aws-cdk-lib/aws-logs";

export class EcsStack extends Stack {

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        // Get VPC
        const ecsVpc = Vpc.fromVpcAttributes(
            this,
            'ecs-stack-vpc',{
                vpcId: Fn.importValue('vpc-id'),
                availabilityZones: [
                    'ap-northeast-2a',
                    'ap-northeast-2b',
                ],
            }
        );

        // Get Security Group
        const ecsSecurityGroup = SecurityGroup.fromSecurityGroupId(
            this,
            'ecs-stack-sg',
            Fn.importValue('ecs-sg')
        );

        // Get Private Subnet
        const ecsPrivateSubnet1 = Subnet.fromSubnetId(
            this,
            'ecs-stack-private-subnet-1',
            Fn.importValue('private-subnet-1-id')
        );

        const ecsPrivateSubnet2 = Subnet.fromSubnetId(
            this,
            'ecs-stack-private-subnet-2',
            Fn.importValue('private-subnet-2-id')
        );

        // Get ALB TargetGroup
        const ecsApplicationTargetGroup = ApplicationTargetGroup.fromTargetGroupAttributes(
            this,
            'ecs-stack-application-target-group',{
                targetGroupArn: Fn.importValue('alb-target-group-arn')
            }
        );

        // Get ECS Task Role
        const ecsTackRole = Role.fromRoleArn(
            this,
            'ecs-stack-task-role',
            Fn.importValue('ecs-task-role-arn'),
        );

        // Get ECS Execution Role
        const ecsExecutionRole = Role.fromRoleArn(
            this,
            'ecs-stack-execution-role',
            Fn.importValue('ecs-execution-role-arn')
        );

        // Get SSM Parameter
        const ssmDbPassword = StringParameter.fromSecureStringParameterAttributes(
            this,
            'db-password',{
                version: 1,
                parameterName: 'db-password',
            }
        );

        // Get ECR
        const ecrSpinOff = Repository.fromRepositoryAttributes(
            this,
            'ecr-spin-off-ecr_uri',{
                repositoryName: 'spin-off-ecr',
                repositoryArn: Fn.importValue('ecr-spin-off-arn'),
            }
        );

        // Create ECS Cluster
        const spinOffEcsCluster = new Cluster(
            this,
            'spin-off-private-ecs-cluster',{
                clusterName: 'spin-off-private-ecs-cluster',
                containerInsights: true,
                vpc: ecsVpc
            }
        );
        // /*
        // Create ECS Task Definition
        const ecsSpinOffTaskDefinition = new FargateTaskDefinition(
            this,
            'spin-off-private-api-ecs-task',{
                cpu: 1024,
                memoryLimitMiB: 2048,
                taskRole: ecsTackRole,
                executionRole: ecsExecutionRole
            }
        );

        // Add Ecr Spin Off Container (Task Definition)
        const ecsSpinOffContainer = ecsSpinOffTaskDefinition.addContainer(
            'spin-off-private-ecs-container',{
                image: ContainerImage.fromRegistry(ecrSpinOff.repositoryUri),
                containerName: 'spin-off-api',
                memoryLimitMiB: 1024,
                portMappings: [{
                    protocol: Protocol.TCP,
                    containerPort: 8080,
                    hostPort:8080
                }],
                logging: LogDriver.awsLogs({
                    streamPrefix: 'ecs',
                    logGroup: LogGroup.fromLogGroupName(
                        this,
                        'spin-off-api-log-group',
                        '/ecs/spin-off/api'
                    )
                }),
                healthCheck: { // 컨테이너 안의 프로세스가 정상적으로 작동하는지 체크
                    command: ['CMD-SHELL', 'curl -f http://localhost:8080/healthCheck || exit 1'],
                    interval: Duration.seconds(300),
                    retries: 5,
                    timeout: Duration.seconds(60),
                },
                environment: {
                    "ENV": 'spin-off'
                },
                secrets: {
                    'DB_PASSWORD': Secret.fromSsmParameter(ssmDbPassword)
                },
                dockerLabels: {
                    'name': 'spin-off-api',
                    'env': 'spin-off'
                }
            }
        );

        // Create ECS Service
        const ecsApiService = new FargateService(
            this,
            'spin-off-private-api-ecs-service',{
                taskDefinition: ecsSpinOffTaskDefinition,
                cluster: spinOffEcsCluster,
                vpcSubnets: {
                    subnets: [ecsPrivateSubnet1, ecsPrivateSubnet2]
                },
                securityGroups: [ecsSecurityGroup],
                serviceName: 'spin-off-private-api-ecs-service',
                assignPublicIp: true,
            }
        );

        // add Target Group 80
        ecsApiService.attachToApplicationTargetGroup(
            ecsApplicationTargetGroup
        );

        // */
    }
}