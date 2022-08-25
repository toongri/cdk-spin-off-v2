import {CfnOutput, Stack, StackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {BlockPublicAccess, Bucket, HttpMethods} from "aws-cdk-lib/aws-s3";
import {AnyPrincipal, Effect, PolicyStatement} from "aws-cdk-lib/aws-iam";

export class S3Stack extends Stack {

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        // Create public S3
        const publicS3 = new Bucket(
            this,
            'spin-off-public-s3',{
                blockPublicAccess: new BlockPublicAccess({ // access control list
                    blockPublicAcls: false,
                    blockPublicPolicy: false,
                    ignorePublicAcls: false,
                    restrictPublicBuckets: false,
                    }
                ),
            publicReadAccess: true,
            }
        );

        // Add Cors Rule (Public S3)
        publicS3.addCorsRule({
            allowedMethods: [HttpMethods.GET, HttpMethods.POST, HttpMethods.DELETE],
            allowedOrigins: ["*"],
        });

        // Create Policy_1 (Public S3)
        const publicS3Policy1 = new PolicyStatement({
            sid: "AllowPublic",
            effect: Effect.ALLOW,
            principals: [new AnyPrincipal()],
            resources: [publicS3.arnForObjects("*")],
            actions: ["s3:GetObject", "s3:GetObjectVersion", "s3:DeleteObject", "s3:PutObject"],
        });

        // Add Policy_1 (Public S3)
        publicS3.addToResourcePolicy(publicS3Policy1);

        // output
        new CfnOutput(
            this,
            "s3-stack-name", {
                value: this.artifactId,
                exportName: 's3-stack-name',
            }
        );
    }
}