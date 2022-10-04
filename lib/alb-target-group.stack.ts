import {aws_elasticloadbalancingv2, CfnOutput, Duration, Fn, Stack, StackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {SecurityGroup, Subnet, Vpc} from "aws-cdk-lib/aws-ec2";
import {
    ApplicationLoadBalancer,
    ApplicationProtocol,
    ApplicationTargetGroup, ListenerAction,
    TargetType
} from "aws-cdk-lib/aws-elasticloadbalancingv2";

export class AlbTargetGroupStack extends Stack {

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const spinOffVpc = Vpc.fromVpcAttributes(
            this,
            'spin-off-alb-vpc', {
                vpcId: Fn.importValue('vpc-id'),
                availabilityZones: ['ap-northeast-2a', 'ap-northeast-2b'],
            }
        );

        // Create ALB (API)
        const spinOffApiAlb = new ApplicationLoadBalancer(
            this,
            'spin-off-api-alb',{
                securityGroup: SecurityGroup.fromSecurityGroupId(
                    this,
                    'spin-off-api-alb-sg',
                    Fn.importValue('alb-sg')),
                vpc: spinOffVpc,
                internetFacing: true,
                loadBalancerName: 'spin-off-api-alb',
                vpcSubnets: {
                    subnets: [
                        Subnet.fromSubnetAttributes(
                            this,
                            'spin-off-api-alb-subnet-1',{
                                subnetId: Fn.importValue('public-subnet-1-id'),
                            }
                        ),
                        Subnet.fromSubnetAttributes(
                            this,
                            'spin-off-api-alb-subnet-2',{
                                subnetId: Fn.importValue('public-subnet-2-id'),
                            }
                        )
                    ]
                },
            }
        );

        //Create Listener (API ALB Listener 80)
        const spinOffApiAlbListener = new ApplicationTargetGroup(
            this,
            'spin-off-api-alb-listener-80',{
                port: 8080,
                targetGroupName: 'spin-off-api-alb-listener',
                healthCheck: {
                    path: '/healthCheck',
                    timeout: Duration.seconds(120),
                    interval: Duration.seconds(180),
                },
                vpc: spinOffVpc,
                targetType: TargetType.IP,
            }
        );

        const spinOffApiAlbAddListener80 = spinOffApiAlb.addListener(
            'spin-off-api-alb-add-listener-80',{
                protocol: ApplicationProtocol.HTTP,
                port: 80,
                defaultAction: ListenerAction.forward([
                    spinOffApiAlbListener
                ])
            }
        );
        //output
        new CfnOutput(
            this,
            'alb-arn',{
                value: spinOffApiAlb.loadBalancerArn,
                exportName: 'alb-arn',
            }
        );

        new CfnOutput(
            this,
            'alb-dns-name',{
                value: spinOffApiAlb.loadBalancerDnsName,
                exportName: 'alb-dns-name',
            }
        );

        new CfnOutput(
            this,
            'alb-target-group-arn',{
                value: spinOffApiAlbListener.targetGroupArn,
                exportName: 'alb-target-group-arn',
            }
        )
    }
}