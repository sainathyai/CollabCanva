#!/bin/bash

# AWS ECS Secrets Setup Script
# This script stores environment variables securely in AWS Systems Manager Parameter Store

set -e

echo "🔐 AWS ECS Secrets Setup"
echo "========================"
echo ""

AWS_REGION=${AWS_REGION:-us-east-1}
PARAM_PREFIX="/collabcanvas/prod"

echo "📋 Configuration:"
echo "   Region: $AWS_REGION"
echo "   Parameter Prefix: $PARAM_PREFIX"
echo ""

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS CLI not configured. Run 'aws configure' first."
    exit 1
fi

echo "✅ AWS CLI configured"
echo ""

# Function to store parameter
store_parameter() {
    local param_name=$1
    local param_type=$2
    local prompt_text=$3
    
    echo "📝 $prompt_text"
    read -sp "   Enter value (hidden): " param_value
    echo ""
    
    if [[ -z "$param_value" ]]; then
        echo "   ⚠️  Skipped (empty value)"
        return
    fi
    
    aws ssm put-parameter \
        --name "$PARAM_PREFIX/$param_name" \
        --value "$param_value" \
        --type "$param_type" \
        --overwrite \
        --region $AWS_REGION &> /dev/null
    
    echo "   ✅ Stored as $PARAM_PREFIX/$param_name"
}

store_string_parameter() {
    local param_name=$1
    local param_value=$2
    
    aws ssm put-parameter \
        --name "$PARAM_PREFIX/$param_name" \
        --value "$param_value" \
        --type "String" \
        --overwrite \
        --region $AWS_REGION &> /dev/null
    
    echo "   ✅ Stored $param_name"
}

echo "🔒 Storing Secure Parameters..."
echo "================================"
echo ""

# Firebase Credentials
store_parameter "firebase-project-id" "String" "Firebase Project ID"
store_parameter "firebase-client-email" "SecureString" "Firebase Service Account Email"
store_parameter "firebase-private-key" "SecureString" "Firebase Private Key"

echo ""
echo "☁️  Storing AWS Credentials..."
echo "================================"
echo ""

# AWS Credentials (for DynamoDB access from ECS)
store_parameter "aws-access-key-id" "SecureString" "AWS Access Key ID"
store_parameter "aws-secret-access-key" "SecureString" "AWS Secret Access Key"

echo ""
echo "⚙️  Storing Configuration..."
echo "============================"
echo ""

# Non-sensitive configuration
store_string_parameter "node-env" "production"
store_string_parameter "port" "8080"
store_string_parameter "aws-region" "$AWS_REGION"
store_string_parameter "dynamodb-table-prefix" "collabcanvas"

echo ""
echo "🌐 CORS Configuration..."
echo "========================"
echo ""

read -p "Enter allowed origins (comma-separated, e.g., https://app.com,https://www.app.com): " allowed_origins
if [[ -n "$allowed_origins" ]]; then
    store_string_parameter "allowed-origins" "$allowed_origins"
fi

echo ""
echo "================================"
echo "✅ All secrets stored in AWS SSM!"
echo "================================"
echo ""
echo "📋 Summary of parameters:"
aws ssm get-parameters-by-path \
    --path "$PARAM_PREFIX" \
    --region $AWS_REGION \
    --query "Parameters[*].[Name,Type]" \
    --output table

echo ""
echo "🔍 To view a parameter:"
echo "   aws ssm get-parameter --name \"$PARAM_PREFIX/node-env\" --region $AWS_REGION"
echo ""
echo "🔒 To view a secure parameter:"
echo "   aws ssm get-parameter --name \"$PARAM_PREFIX/firebase-private-key\" --with-decryption --region $AWS_REGION"
echo ""
echo "📝 Next Steps:"
echo "   1. Create ECS Task Definition with these parameters"
echo "   2. Ensure ECS Task Execution Role has ssm:GetParameters permission"
echo "   3. Deploy your ECS service"
echo ""
echo "💡 See: task-definition-with-secrets.json for example configuration"

