#!/bin/bash

# GenFree Network Frontend Deployment Script
# Deploys React frontend to various platforms

set -e

echo "🚀 GenFree Network Frontend Deployment"
echo "======================================"

# Function to display menu
show_menu() {
    echo ""
    echo "Select deployment platform:"
    echo "1. Netlify (Current - Update)"
    echo "2. Vercel"
    echo "3. GitHub Pages"
    echo "4. Firebase Hosting"
    echo "5. AWS S3 + CloudFront"
    echo "6. DigitalOcean App Platform"
    echo "7. Build Only (Local)"
    echo "8. Exit"
    echo ""
}

# Function to update environment for production
update_env_for_production() {
    echo "📝 Updating environment variables for production..."
    
    # Backup current .env
    if [ -f .env ]; then
        cp .env .env.backup
        echo "✅ Backed up current .env to .env.backup"
    fi
    
    # Get backend URL from user
    echo ""
    read -p "Enter your Django backend URL (e.g., https://your-backend.herokuapp.com): " BACKEND_URL
    
    if [ -z "$BACKEND_URL" ]; then
        echo "❌ Backend URL is required for production deployment"
        exit 1
    fi
    
    # Update .env for production
    cat > .env << EOF
# Production Environment Variables
VITE_API_BASE_URL=${BACKEND_URL}/api
VITE_WS_BASE_URL=${BACKEND_URL/https:/wss:}/ws

# Flutterwave (use production keys for live deployment)
VITE_FLUTTERWAVE_PUBLIC_KEY=${VITE_FLUTTERWAVE_PUBLIC_KEY}

# Analytics
VITE_GOOGLE_ANALYTICS_ID=${VITE_GOOGLE_ANALYTICS_ID}
EOF
    
    echo "✅ Updated .env for production with backend: $BACKEND_URL"
}

# Function to build project
build_project() {
    echo "🔨 Building React project..."
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing dependencies..."
        npm install --legacy-peer-deps
    fi
    
    # Build project
    echo "🏗️ Running build..."
    npm run build
    
    if [ $? -eq 0 ]; then
        echo "✅ Build completed successfully"
        echo "📁 Build files created in: dist/"
    else
        echo "❌ Build failed"
        exit 1
    fi
}

# Function to deploy to Netlify
deploy_netlify() {
    echo "🌐 Deploying to Netlify..."
    
    # Check if netlify-cli is installed
    if ! command -v netlify &> /dev/null; then
        echo "📦 Installing Netlify CLI..."
        npm install -g netlify-cli
    fi
    
    # Login to Netlify
    echo "🔐 Please login to Netlify..."
    netlify login
    
    # Deploy
    echo "🚀 Deploying to Netlify..."
    netlify deploy --prod --dir=dist
    
    echo "✅ Deployment to Netlify completed!"
}

# Function to deploy to Vercel
deploy_vercel() {
    echo "▲ Deploying to Vercel..."
    
    # Check if vercel-cli is installed
    if ! command -v vercel &> /dev/null; then
        echo "📦 Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    # Deploy
    echo "🚀 Deploying to Vercel..."
    vercel --prod
    
    echo "✅ Deployment to Vercel completed!"
}

# Function to deploy to GitHub Pages
deploy_github_pages() {
    echo "📚 Deploying to GitHub Pages..."
    
    # Check if gh-pages is installed
    if ! npm list gh-pages &> /dev/null; then
        echo "📦 Installing gh-pages..."
        npm install --save-dev gh-pages
    fi
    
    # Update package.json with homepage
    echo "📝 Updating package.json for GitHub Pages..."
    read -p "Enter your GitHub repository name (e.g., username/repo-name): " GITHUB_REPO
    
    # Add deploy script to package.json
    npm pkg set scripts.deploy="gh-pages -d dist"
    npm pkg set homepage="https://${GITHUB_REPO%/*}.github.io/${GITHUB_REPO#*/}"
    
    # Deploy
    echo "🚀 Deploying to GitHub Pages..."
    npm run deploy
    
    echo "✅ Deployment to GitHub Pages completed!"
    echo "🌐 Your site will be available at: https://${GITHUB_REPO%/*}.github.io/${GITHUB_REPO#*/}"
}

# Function to deploy to Firebase
deploy_firebase() {
    echo "🔥 Deploying to Firebase Hosting..."
    
    # Check if firebase-tools is installed
    if ! command -v firebase &> /dev/null; then
        echo "📦 Installing Firebase CLI..."
        npm install -g firebase-tools
    fi
    
    # Initialize Firebase if not already done
    if [ ! -f "firebase.json" ]; then
        echo "⚡ Initializing Firebase..."
        firebase login
        firebase init hosting
    fi
    
    # Deploy
    echo "🚀 Deploying to Firebase..."
    firebase deploy
    
    echo "✅ Deployment to Firebase completed!"
}

# Function to create AWS S3 deployment
deploy_aws_s3() {
    echo "☁️ Setting up AWS S3 + CloudFront deployment..."
    
    # Create deployment script
    cat > deploy-aws.sh << 'EOF'
#!/bin/bash
# AWS S3 + CloudFront Deployment

# Configuration
BUCKET_NAME="your-bucket-name"
CLOUDFRONT_ID="your-cloudfront-distribution-id"
REGION="us-east-1"

# Sync to S3
echo "📤 Uploading to S3..."
aws s3 sync dist/ s3://$BUCKET_NAME --delete

# Invalidate CloudFront cache
echo "🔄 Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_ID --paths "/*"

echo "✅ AWS deployment completed!"
EOF
    
    chmod +x deploy-aws.sh
    
    echo "✅ Created AWS deployment script: deploy-aws.sh"
    echo "📝 Please update the script with your bucket name and CloudFront ID"
    echo "🚀 Run ./deploy-aws.sh to deploy"
}

# Function to deploy to DigitalOcean
deploy_digitalocean() {
    echo "🌊 Setting up DigitalOcean App Platform deployment..."
    
    # Create app spec
    cat > .do/app.yaml << EOF
name: genfree-network-frontend
services:
- name: web
  source_dir: /
  github:
    repo: your-username/genfree-network
    branch: main
  run_command: npm start
  build_command: npm run build
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  http_port: 3000
  routes:
  - path: /
  envs:
  - key: VITE_API_BASE_URL
    value: ${BACKEND_URL}/api
  - key: VITE_FLUTTERWAVE_PUBLIC_KEY
    value: ${VITE_FLUTTERWAVE_PUBLIC_KEY}
static_sites:
- name: frontend
  source_dir: dist
  build_command: npm run build
  output_dir: dist
  routes:
  - path: /
EOF
    
    echo "✅ Created DigitalOcean app specification"
    echo "📋 Next steps:"
    echo "1. Go to https://cloud.digitalocean.com/apps"
    echo "2. Create new app from GitHub"
    echo "3. Use the generated .do/app.yaml file"
}

# Main deployment flow
main() {
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        echo "❌ Error: package.json not found. Please run this script from your React project root."
        exit 1
    fi
    
    # Show menu and get user choice
    while true; do
        show_menu
        read -p "Enter your choice (1-8): " choice
        
        case $choice in
            1)
                update_env_for_production
                build_project
                deploy_netlify
                break
                ;;
            2)
                update_env_for_production
                build_project
                deploy_vercel
                break
                ;;
            3)
                update_env_for_production
                build_project
                deploy_github_pages
                break
                ;;
            4)
                update_env_for_production
                build_project
                deploy_firebase
                break
                ;;
            5)
                update_env_for_production
                build_project
                deploy_aws_s3
                break
                ;;
            6)
                update_env_for_production
                build_project
                deploy_digitalocean
                break
                ;;
            7)
                build_project
                echo "✅ Build completed. Files are in the dist/ directory."
                break
                ;;
            8)
                echo "👋 Goodbye!"
                exit 0
                ;;
            *)
                echo "❌ Invalid choice. Please select 1-8."
                ;;
        esac
    done
    
    echo ""
    echo "🎉 Deployment process completed!"
    echo "📋 Post-deployment checklist:"
    echo "1. ✅ Verify your site is loading correctly"
    echo "2. ✅ Test the donation system with backend"
    echo "3. ✅ Check live streaming functionality"
    echo "4. ✅ Test real-time chat features"
    echo "5. ✅ Verify all API integrations are working"
    echo ""
    echo "🔗 Don't forget to update your DNS settings if using a custom domain!"
}

# Run the main function
main