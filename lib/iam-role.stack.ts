import {CfnOutput, Stack, StackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {
    CompositePrincipal,
    Effect,
    ManagedPolicy,
    PolicyDocument,
    PolicyStatement,
    Role,
    ServicePrincipal
} from "aws-cdk-lib/aws-iam";

export class IamRoleStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        //새로운 역할 추가
        //ECS Task Role
        const ecsTaskRole = new Role(
            this,
            'spin-off-ecs-task-iam-role', { // id값 설정
                assumedBy: new ServicePrincipal('ecs-tasks.amazonaws.com'), // 역할 수행 결정
                roleName: 'spin-off-ecs-task-iam-role', // 역할 이름 결정
                inlinePolicies: { // 정책목록 리스트화
                    PolicyEcsServerTaskOrExecutionPolicy: new PolicyDocument({ // statement 들의 컬렉션 클래스
                        statements: [new PolicyStatement({ //statement -> 정책의 주요 요소 pli
                            resources: ['*'], // 리소스 모음 -> 모든 uri에 대해 허용한다.
                            actions: [
                                's3:*',
                                'cloudwatch:*',
                                'logs:*',
                                'lambda:*',
                            ], // 작업 모음 -> s3가 할수있는 모든 작업을 허용한다.
                        })]
                    }),
                },
                managedPolicies: [
                    ManagedPolicy.fromAwsManagedPolicyName("AWSXRayDaemonWriteAccess")
                ],
            });

        //ECS Execution Role
        const ecsExecutionRole = new Role(
            this,
            'spin-off-ecs-execution-iam-role', { //id 값 설정
                assumedBy: new ServicePrincipal('ecs-tasks.amazonaws.com'), // 역할 수행 결정
                roleName: 'spin-off-ecs-execution-iam-role', // 역할 이름 결정
                inlinePolicies: { // 정책목록 리스트화
                    PolicyEcsServerTaskOrExecutionPolicy: new PolicyDocument({ // statement 들의 컬렉션 클래스
                        statements: [new PolicyStatement({ //statement -> 정책의 주요 요소 pli
                            resources: ['*'], // 리소스 모음 -> 모든 uri에 대해 허용한다.
                            actions: [
                                's3:*',
                                'cloudwatch:*',
                                'logs:*',
                                'lambda:*',
                            ], // 작업 모음 -> s3가 할수있는 모든 작업을 허용한다.
                        })],
                    }),
                },
                managedPolicies: [
                    ManagedPolicy.fromManagedPolicyArn(
                        this,
                        "ECSTaskExecutionRolePolicy",
                        "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
                    )
                ],
        });

        // Code Deploy Role
        // new Role(
        //     this,
        //     'spin-off-codedeploy-iam-role',{
        //         assumedBy: new ServicePrincipal('codedeploy.amazonaws.com'),
        //         roleName: 'spin-off-codedeploy-iam-role',
        //         inlinePolicies: {
        //             policy: new PolicyDocument({
        //                 statements: [new PolicyStatement({
        //                     sid: 'RegisterTaskDefinition',
        //                     effect: Effect.ALLOW,
        //                     actions: ['ecs:RegisterTaskDefinition'],
        //                     resources: ['*']
        //                 }), new PolicyStatement({
        //                     sid: 'PassRolesInTaskDefinition',
        //                     effect: Effect.ALLOW,
        //                     actions: ['iam:PassRole'],
        //                     resources:[
        //                         ''
        //                     ]
        //                 })]
        //             })}
        //     }
        // )

        //SSM RDS Role
        const rdsSsmRole = new Role(
            this,
            'spin-off-ssm-iam-role',{
                assumedBy: new CompositePrincipal(
                    new ServicePrincipal('rds.amazonaws.com'),
                    new ServicePrincipal('ssm.amazonaws.com')),
                roleName: 'spin-off-ssm-rds-iam-role',
                inlinePolicies: { // 정책목록 리스트화
                    SSMRolePolicy: new PolicyDocument({ // statement 들의 컬렉션 클래스
                        statements: [new PolicyStatement({ //statement -> 정책의 주요 요소 pli
                            resources: ['*'], // 리소스 모음 -> 모든 uri에 대해 허용한다.
                            actions: [
                                's3:*',
                                'cloudwatch:*',
                                'logs:*',
                                'rds:*',
                                'ssm:*'
                            ], // 작업 모음 -> s3가 할수있는 모든 작업을 허용한다.
                        })],
                    }),
                },
                managedPolicies: [
                    ManagedPolicy.fromManagedPolicyArn(
                        this,
                        "AmazonSSMManagedInstanceCore",
                        'arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore'
                    )
                ]
            }
        );

        // print the IAM role arn for this service account
        new CfnOutput(this, "ecs-task-role", {
            value: ecsTaskRole.roleArn,
            exportName: "ecs-task-role-arn",
        });

        new CfnOutput(this, "ecs-execution-role", {
            value: ecsExecutionRole.roleArn,
            exportName: "ecs-execution-role-arn",
        });

        new CfnOutput(this, "rds-ssm-role", {
            value: rdsSsmRole.roleArn,
            exportName: "rds-ssm-role-arn",
        });

    }
}
