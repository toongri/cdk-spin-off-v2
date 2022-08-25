import {Stack, StackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {CfnLogGroup} from "aws-cdk-lib/aws-logs";

export class CloudWatchLogStack extends Stack {

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        // Create Xray Logs (L1)
        const xrayCloudWatchLogs = new CfnLogGroup(
            this,
            'spin-off-xray-logs', {
                logGroupName: '/ecs/spin-off/xray',
            }
        );

        // Create API Logs (L2)
        const apiLogs = new CfnLogGroup(
            this,
            'spin-off-api-logs',{
                logGroupName: '/ecs/spin-off/api'
            }
        );
    }
}