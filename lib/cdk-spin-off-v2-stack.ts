import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {IamRoleStack} from "./iam-role.stack";
import {VpcSubnetStack} from "./vpc-subnet.stack";
import {SecurityGroupStack} from "./security-group.stack";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CdkSpinOffV2Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const iamRoleStack = new IamRoleStack(this, 'IamRoleStack');
    const vpcSubnetStack = new VpcSubnetStack(this, "VpcSubnetStack");
    const securityGroupStack = new SecurityGroupStack(this, "SecurityGroupStack");

    vpcSubnetStack.addDependency(iamRoleStack);
    securityGroupStack.addDependency(vpcSubnetStack);
  }
}
