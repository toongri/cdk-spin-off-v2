#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkSpinOffV2Stack } from '../lib/cdk-spin-off-v2-stack';

const app = new cdk.App();
new CdkSpinOffV2Stack(app, 'CdkSpinOffV2Stack', {

});