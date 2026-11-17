---
id: aws-cdk
description: Least-privilege CDK, required tags, and explicit removal policies
tags: ["infrastructure", "aws"]
file_patterns: ["infra/**/*.ts", "cdk/**/*.ts"]
global: false
---

# AWS CDK

## IAM

Do not attach `AdministratorAccess` or `AmazonS3FullAccess`. Grant a specific action on a specific resource with CDK helpers such as `bucket.grantRead(fn)`.

## Tags and identity

Tag the stack with `Environment`, `Project`, and `CostCenter` so a new resource cannot omit them. Read region and account from `Stack.of(this)`. Do not hardcode either.

## Stateful resources

Set `removalPolicy` on S3 buckets, DynamoDB tables, and RDS instances. Production uses `RETAIN`. Use `DESTROY` only when the stack environment is dev.

```ts
// Bad
fn.role?.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName("AdministratorAccess"));

// Good
bucket.grantRead(fn);
Tags.of(this).add("Environment", envName);
```
