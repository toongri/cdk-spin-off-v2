import {CfnOutput, Stack, StackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {CfnRepository} from "aws-cdk-lib/aws-ecr";

export class EcrStack extends Stack {

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        // Create Example ECR
        const ecrExample = new CfnRepository(
            this,
            'spin-off-private-ecr',{
                imageTagMutability: 'MUTABLE', // 변경 가능 여부 설정
                repositoryName: 'spin-off-ecr'
            }
        );

        new CfnOutput(
            this,
            'ecr-spin-off-arn',{
                value: ecrExample.attrArn,
                exportName: 'ecr-spin-off-arn',
            }
        );
    }
}