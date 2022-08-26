import {Fn, Stack, StackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {CfnEIP, CfnEIPAssociation, CfnInstance, UserData} from "aws-cdk-lib/aws-ec2";

export class BastionEc2Stack extends Stack {

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        // ec2 bastion instance shell command
        const ec2BastionInstanceShellCommands = UserData.forLinux();
        ec2BastionInstanceShellCommands.addCommands(
            'sudo apt-get update && sudo apt-get install squid',
            'echo "http_port 3306 transparent" | sudo tee -a /etc/squid/squid/conf',
            'sudo sed -i "s/http_access deny all/http_access allow all/" /etc/squid/squid.conf',
            'sudo systemctl restart squid'
        )

        // create instance (using cfninstance)
        const ec2BastionInstance = new CfnInstance(
            this,
            'spin-off-bastion-instance',{
                imageId: 'ami-01d87646ef267ccd7',
                instanceInitiatedShutdownBehavior: 'terminate',
                instanceType: 't3.nano',
                keyName: 'spinoff-springboot-webservice',
                securityGroupIds: [Fn.importValue('bastion-sg')],
                subnetId: Fn.importValue('public-subnet-1-id'),
                userData: Fn.base64(ec2BastionInstanceShellCommands.render()),
            }
        );

        // Create EIP (ec2_bastion_instance)
        const ec2BastionInstanceEip = new CfnEIP(
            this,
            'spin-off-bastion-instance-eip'
        );

        // Create Association (ec2_bastion_instance)
        const ec2BastionInstance1EipAsso = new CfnEIPAssociation(
            this,
            'spin-off-bastion-instance-eip-asso',{
                eip: ec2BastionInstanceEip.ref,
                instanceId: ec2BastionInstance.ref
            }
        );
    }
}