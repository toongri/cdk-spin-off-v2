import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {IamRoleStack} from "./iam-role.stack";
import {VpcSubnetStack} from "./vpc-subnet.stack";
import {SecurityGroupStack} from "./security-group.stack";
import {S3Stack} from "./s3.stack";
import {CloudWatchLogStack} from "./cloud-watch-log.stack";
import {AlbTargetGroupStack} from "./alb-target-group.stack";
import {BastionEc2Stack} from "./bastion-ec2.stack";
import {RdsStack} from "./rds.stack";

export class CdkSpinOffV2Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const iamRoleStack = new IamRoleStack(this, 'IamRoleStack');
    const vpcSubnetStack = new VpcSubnetStack(this, "VpcSubnetStack");
    const securityGroupStack = new SecurityGroupStack(this, "SecurityGroupStack");
    const s3Stack = new S3Stack(this, "S3Stack");
    const cloudWatchLogStack = new CloudWatchLogStack(this, 'CloudWatchLogStack');
    const albTargetGroupStack = new AlbTargetGroupStack(this, 'AlbTargetGroupStack');
    const bastionEc2Stack = new BastionEc2Stack(this, 'BastionEc2Stack');
    const rdsStack = new RdsStack(this, 'RdsStack');

    vpcSubnetStack.addDependency(iamRoleStack);
    securityGroupStack.addDependency(vpcSubnetStack);
    s3Stack.addDependency(securityGroupStack);
    cloudWatchLogStack.addDependency(s3Stack);
    albTargetGroupStack.addDependency(cloudWatchLogStack);
    bastionEc2Stack.addDependency(albTargetGroupStack);
    rdsStack.addDependency(bastionEc2Stack);
  }
}
