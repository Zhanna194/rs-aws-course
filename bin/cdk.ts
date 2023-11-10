#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins"

const app = new cdk.App();
const stack = new cdk.Stack(app, 'AWSShopReactStack', {
    env: { region: process.env.CDK_REGION}
});

const myBucket = new s3.Bucket(stack, 'WebAppBucket', {
    bucketName: 'rs-aws-course-bucket2',
})

const originAccessIdentity = new cloudfront.OriginAccessIdentity(stack, 'WebBucketOAI', {
    comment: myBucket.bucketName
})
myBucket.grantRead(originAccessIdentity)

const distribution = new cloudfront.Distribution(stack, 'WebAppDistribution', {
    defaultBehavior: {
        origin: new origins.S3Origin(myBucket, {
            originAccessIdentity
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS
    },
    defaultRootObject: 'index.html',
    errorResponses:[
        { httpStatus: 404,
            responseHttpStatus: 200,
            responsePagePath: '/index.html',
        }
    ]
})

new s3deploy.BucketDeployment(stack, 'DeployWebApplication', {
    sources: [s3deploy.Source.asset('./dist')],
    destinationBucket: myBucket,
    distribution: distribution,
    distributionPaths: ['/*']
});

new cdk.CfnOutput(stack, "Domain URL", {
    value: distribution.distributionDomainName
})
