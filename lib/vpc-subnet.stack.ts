import {CfnOutput, Stack, StackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {
    CfnEIP,
    CfnInternetGateway, CfnNatGateway, CfnRoute,
    CfnRouteTable,
    CfnSubnet, CfnSubnetRouteTableAssociation,
    CfnVPC,
    CfnVPCGatewayAttachment
} from "aws-cdk-lib/aws-ec2";

export class VpcSubnetStack extends Stack {

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        //Create VPC
        const vpc = new CfnVPC(
            this,
            'spin-off-vpc', {
                cidrBlock: '172.0.0.0/16',// VPC안의 ipv4 네트워크의 범위를 설정
                enableDnsHostnames: true,// VPC에서 시작된 인스턴스가 DNS 호스트 이름을 가져올지 여부를 나타냄.
                enableDnsSupport: true,// DNS resolution이 VPC에서 지원되는지 여부를 나타냄.
            }
        );

        //Create subnet_1 (public)
        const publicSubnet1 = new CfnSubnet(
            this,
            'spin-off-public-1', {
                cidrBlock: '172.0.0.0/28',
                vpcId: vpc.ref, //vpcId 설정 -> ref -> 지정된 파라미터 또는 리소스에 대한 물리적 id나 값 등의 정보를 반환함.
                availabilityZone: 'ap-northeast-2a', //가용지역 설정
                mapPublicIpOnLaunch: true, //공개범위 설정
            }
        );

        //Create subnet_2 (public)
        const publicSubnet2 = new CfnSubnet(
            this,
            'spin-off-public-2', {
                cidrBlock: '172.0.0.16/28',
                vpcId: vpc.ref,
                availabilityZone: 'ap-northeast-2b',
                mapPublicIpOnLaunch: true,
            }
        );

        //Create subnet_1 (private)
        const privateSubnet1 = new CfnSubnet(
            this,
            'spin-off-private-1', {
                cidrBlock: '172.0.0.64/28',
                vpcId: vpc.ref,
                availabilityZone: 'ap-northeast-2a',
            }
        );

        //Create subnet_2 (private)
        const privateSubnet2 = new CfnSubnet(
            this,
            'spin-off-private-2', {
                cidrBlock: '172.0.0.80/28',
                vpcId: vpc.ref,
                availabilityZone: 'ap-northeast-2b',
            }
        );

        //Create Elastic IP
        const eip = new CfnEIP(
            this,
            'spin-off-vpc-eip');

        //Create Internet Gateway
        const internetGateway = new CfnInternetGateway(
            this,
            'spin-off-vpc-internet-gateway',
        );

        // Attachment Internet Gateway
        const attachmentInternetGateway = new CfnVPCGatewayAttachment(
            this,
            'spin-off-attachment-internet-gateway', {
                vpcId: vpc.ref,
                internetGatewayId: internetGateway.ref,

            }
        );

        // Create NAT Gateway
        // network address translation 서비스, 네트워크 주소변환
        // 외부 서비스에서 프라이빗 서브넷의 인스턴스로 접근할 수 없게 하되, 프라이빗 서브넷의 인스턴스에서는 외부 서비스로 접근할 수 있게 해주는 서비스
        const natGateway = new CfnNatGateway(
            this,
            'spin-off-vpc-nat-gateway', {
                allocationId: eip.attrAllocationId,
                subnetId: publicSubnet1.ref,
            }
        );

        //Create Route Table + Route
        //public_subnet_1
        const routeTablePublicSubnet1 = new CfnRouteTable(
            this,
            'spin-off-vpc-route-table-public-1', {
                vpcId:vpc.ref
            }
        );
        const routePublicSubnet1 = new CfnRoute(
            this,
            'spin-off-vpc-route-public-1', {
                routeTableId: routeTablePublicSubnet1.ref,
                gatewayId: internetGateway.ref,
                destinationCidrBlock:'0.0.0.0/0',
            }
        );
        const routeAttachPublicSubnet1 = new CfnSubnetRouteTableAssociation(
            this,
            'spin-off-vpc-route-attach-public-1', {
                routeTableId: routeTablePublicSubnet1.ref,
                subnetId: publicSubnet1.ref,
            }
        );

        //public_subnet_2
        const routeTablePublicSubnet2 = new CfnRouteTable(
            this,
            'spin-off-vpc-route-table-public-2', {
                vpcId:vpc.ref
            }
        );
        const routePublicSubnet2 = new CfnRoute(
            this,
            'spin-off-vpc-route-public-2', {
                routeTableId: routeTablePublicSubnet2.ref,
                gatewayId: internetGateway.ref,
                destinationCidrBlock:'0.0.0.0/0',
            }
        );
        const routeAttachPublicSubnet2 = new CfnSubnetRouteTableAssociation(
            this,
            'spin-off-vpc-route-attach-public-2', {
                routeTableId: routeTablePublicSubnet2.ref,
                subnetId: publicSubnet2.ref,
            }
        );

        //private_subnet_1
        const routeTablePrivateSubnet1 = new CfnRouteTable(
            this,
            'spin-off-vpc-route-table-private-1', {
                vpcId:vpc.ref
            }
        );
        const routePrivateSubnet1 = new CfnRoute(
            this,
            'spin-off-vpc-route-private-1', {
                routeTableId: routeTablePrivateSubnet1.ref,
                gatewayId: internetGateway.ref,
                destinationCidrBlock:'0.0.0.0/0',
            }
        );
        const routeAttachPrivateSubnet1 = new CfnSubnetRouteTableAssociation(
            this,
            'spin-off-vpc-route-attach-private-1', {
                routeTableId: routeTablePrivateSubnet1.ref,
                subnetId: privateSubnet1.ref,
            }
        );

        //private_subnet_2
        const routeTablePrivateSubnet2 = new CfnRouteTable(
            this,
            'spin-off-vpc-route-table-private-2', {
                vpcId:vpc.ref
            }
        );
        const routePrivateSubnet2 = new CfnRoute(
            this,
            'spin-off-vpc-route-private-2', {
                routeTableId: routeTablePrivateSubnet2.ref,
                gatewayId: internetGateway.ref,
                destinationCidrBlock:'0.0.0.0/0',
            }
        );
        const routeAttachPrivateSubnet2 = new CfnSubnetRouteTableAssociation(
            this,
            'spin-off-vpc-route-attach-private-2', {
                routeTableId: routeTablePrivateSubnet2.ref,
                subnetId: privateSubnet2.ref,
            }
        );

        // print the vpc info
        new CfnOutput(
            this,
            "vpc-id", {
                value: vpc.ref,
                exportName: 'vpc-id',
            }
        );

        new CfnOutput(
            this,
            "public-subnet-1", {
                value: publicSubnet1.ref,
                exportName: "public-subnet-1-id",
            }
        );

        new CfnOutput(
            this,
            "public-subnet-2", {
                value: publicSubnet2.ref,
                exportName: "public-subnet-2-id",
            }
        );

        new CfnOutput(
            this,
            "private-subnet-1", {
                value: privateSubnet1.ref,
                exportName: "private-subnet-1-id",
            }
        );

        new CfnOutput(
            this,
            "private-subnet-2", {
                value: privateSubnet2.ref,
                exportName: "private-subnet-2-id",
            }
        );
    }
}