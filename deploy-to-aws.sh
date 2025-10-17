#!/bin/bash

# CollabCanvas AWS Deployment Script
# This script automates deployment to AWS ECS (backend) and Amplify (frontend)

set -e  # Exit on any error

echo "🚀 CollabCanvas AWS Deployment Script"
echo "======================================"
echo ""

# Colors for output
RED='\033[0:31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI not found. Please install it first:${NC}"
    echo "   https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker not found. Please install it first:${NC}"
    echo "   https://docs.docker.com/get-docker/"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"
echo ""

# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=${AWS_REGION:-us-east-1}
ECR_REPOSITORY="collabcanvas-backend"
ECR_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY"

echo "📋 Deployment Configuration:"
echo "   AWS Account: $AWS_ACCOUNT_ID"
echo "   AWS Region: $AWS_REGION"
echo "   ECR Repository: $ECR_REPOSITORY"
echo ""

# Menu
echo "Select deployment option:"
echo "1) Deploy Backend to ECS"
echo "2) Deploy Frontend to Amplify (Git push)"
echo "3) Deploy Both"
echo "4) Setup AWS Infrastructure (First time)"
echo ""
read -p "Enter choice [1-4]: " choice

case $choice in
    1|3)
        echo ""
        echo "🐳 Building and deploying backend..."
        echo "===================================="
        
        # Navigate to backend directory
        cd backend
        
        # Build Docker image
        echo "📦 Building Docker image..."
        docker build -t collabcanvas-backend:latest .
        
        # Create ECR repository if it doesn't exist
        echo "🏗️  Creating ECR repository (if needed)..."
        aws ecr describe-repositories --repository-names $ECR_REPOSITORY --region $AWS_REGION 2>/dev/null || \
        aws ecr create-repository --repository-name $ECR_REPOSITORY --region $AWS_REGION
        
        # Login to ECR
        echo "🔐 Logging in to ECR..."
        aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_URI
        
        # Tag and push image
        echo "🚢 Pushing image to ECR..."
        docker tag collabcanvas-backend:latest $ECR_URI:latest
        docker push $ECR_URI:latest
        
        echo -e "${GREEN}✅ Backend image pushed to ECR${NC}"
        
        # Update ECS service (if exists)
        echo "🔄 Updating ECS service..."
        ECS_CLUSTER="collabcanvas-cluster"
        ECS_SERVICE="collabcanvas-backend-service"
        
        if aws ecs describe-services --cluster $ECS_CLUSTER --services $ECS_SERVICE --region $AWS_REGION 2>/dev/null | grep -q "ACTIVE"; then
            aws ecs update-service \
                --cluster $ECS_CLUSTER \
                --service $ECS_SERVICE \
                --force-new-deployment \
                --region $AWS_REGION
            echo -e "${GREEN}✅ ECS service updated with new image${NC}"
        else
            echo -e "${YELLOW}⚠️  ECS service not found. Please create it manually first.${NC}"
            echo "   See DEPLOYMENT_CHECKLIST.md for instructions."
        fi
        
        cd ..
        ;;
esac

case $choice in
    2|3)
        echo ""
        echo "🌐 Deploying frontend..."
        echo "======================="
        
        # Check if on correct branch
        CURRENT_BRANCH=$(git branch --show-current)
        echo "📍 Current branch: $CURRENT_BRANCH"
        
        # Commit any pending changes
        if [[ -n $(git status -s) ]]; then
            echo "📝 You have uncommitted changes. Commit them first:"
            git status -s
            read -p "Commit changes now? (y/n): " commit_choice
            if [[ $commit_choice == "y" ]]; then
                git add -A
                read -p "Enter commit message: " commit_msg
                git commit -m "$commit_msg"
            else
                echo -e "${RED}❌ Please commit changes before deploying${NC}"
                exit 1
            fi
        fi
        
        # Push to GitHub (triggers Amplify auto-deploy)
        echo "🚀 Pushing to GitHub..."
        git push origin $CURRENT_BRANCH
        
        echo -e "${GREEN}✅ Frontend code pushed to GitHub${NC}"
        echo ""
        echo "📺 Amplify will auto-deploy your frontend."
        echo "   Monitor progress at: https://console.aws.amazon.com/amplify"
        ;;
esac

case $choice in
    4)
        echo ""
        echo "🏗️  AWS Infrastructure Setup"
        echo "============================"
        echo ""
        echo "This will guide you through first-time AWS setup."
        echo ""
        
        # Create ECR repository
        echo "1️⃣  Creating ECR repository..."
        aws ecr create-repository \
            --repository-name $ECR_REPOSITORY \
            --region $AWS_REGION \
            --image-scanning-configuration scanOnPush=true \
            --encryption-configuration encryptionType=AES256
        echo -e "${GREEN}✅ ECR repository created${NC}"
        
        # Create ECS cluster
        echo ""
        echo "2️⃣  Creating ECS Fargate cluster..."
        aws ecs create-cluster \
            --cluster-name collabcanvas-cluster \
            --region $AWS_REGION
        echo -e "${GREEN}✅ ECS cluster created${NC}"
        
        # Instructions for manual steps
        echo ""
        echo "3️⃣  Next steps (manual via AWS Console):"
        echo ""
        echo "   a) Create Application Load Balancer:"
        echo "      - Go to EC2 → Load Balancers → Create"
        echo "      - Type: Application Load Balancer"
        echo "      - Name: collabcanvas-alb"
        echo "      - Listeners: HTTP (80) and HTTPS (443)"
        echo ""
        echo "   b) Create ECS Task Definition:"
        echo "      - Go to ECS → Task Definitions → Create"
        echo "      - Name: collabcanvas-backend-task"
        echo "      - Launch type: Fargate"
        echo "      - CPU: 0.5 vCPU, Memory: 1 GB"
        echo "      - Container image: $ECR_URI:latest"
        echo "      - Port: 8080"
        echo ""
        echo "   c) Create ECS Service:"
        echo "      - Go to ECS → collabcanvas-cluster → Create Service"
        echo "      - Task Definition: collabcanvas-backend-task"
        echo "      - Service name: collabcanvas-backend-service"
        echo "      - Number of tasks: 2"
        echo "      - Load balancer: collabcanvas-alb"
        echo ""
        echo "   d) Create Amplify App:"
        echo "      - Go to AWS Amplify Console"
        echo "      - New App → Host web app"
        echo "      - Connect GitHub repository"
        echo "      - Branch: main"
        echo ""
        echo "📖 Full instructions: See DEPLOYMENT_CHECKLIST.md"
        ;;
esac

echo ""
echo "========================================="
echo -e "${GREEN}🎉 Deployment process completed!${NC}"
echo "========================================="
echo ""
echo "📊 Check deployment status:"
echo "   Backend:  https://console.aws.amazon.com/ecs"
echo "   Frontend: https://console.aws.amazon.com/amplify"
echo ""
echo "📖 For troubleshooting, see DEPLOYMENT_CHECKLIST.md"

