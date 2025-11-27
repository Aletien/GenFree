#!/bin/bash

# 🚀 GenFree Network Quick Production Deployment
# This script deploys both backend and frontend to production

set -e

echo "🌟 GenFree Network Production Deployment"
echo "======================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}⚡ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ] || [ ! -d "backend" ]; then
        print_error "Please run this script from your GenFree Network root directory"
        exit 1
    fi
    
    # Check for required tools
    command -v git >/dev/null 2>&1 || { print_error "Git is required but not installed."; exit 1; }
    command -v node >/dev/null 2>&1 || { print_error "Node.js is required but not installed."; exit 1; }
    command -v npm >/dev/null 2>&1 || { print_error "npm is required but not installed."; exit 1; }
    
    print_success "Prerequisites check passed"
}

# Function to collect deployment information
collect_deployment_info() {
    print_status "Collecting deployment information..."
    
    echo ""
    echo "🔧 Configuration Setup"
    echo "----------------------"
    
    # Platform selection
    echo "Select deployment platforms:"
    echo "1. Heroku (Backend) + Netlify (Frontend) [Recommended]"
    echo "2. Railway (Backend) + Vercel (Frontend)"
    echo "3. Custom setup"
    read -p "Choose option (1-3): " PLATFORM_CHOICE
    
    # Flutterwave credentials
    echo ""
    echo "💳 Flutterwave Configuration"
    read -p "Enter Flutterwave Secret Key: " FLUTTERWAVE_SECRET
    read -p "Enter Flutterwave Public Key: " FLUTTERWAVE_PUBLIC
    read -p "Enter Flutterwave Webhook Secret: " FLUTTERWAVE_WEBHOOK
    
    # Email configuration
    echo ""
    echo "📧 Email Configuration (Optional)"
    read -p "Enter SMTP email username (or press Enter to skip): " EMAIL_USER
    if [ ! -z "$EMAIL_USER" ]; then
        read -s -p "Enter SMTP email password: " EMAIL_PASS
        echo ""
    fi
    
    # Custom domain
    echo ""
    read -p "Enter custom domain (optional, e.g., genfree.org): " CUSTOM_DOMAIN
    
    print_success "Configuration collected"
}

# Function to deploy backend
deploy_backend() {
    case $PLATFORM_CHOICE in
        1)
            deploy_backend_heroku
            ;;
        2)
            deploy_backend_railway
            ;;
        3)
            print_warning "Custom deployment selected. Please configure manually."
            ;;
    esac
}

# Function to deploy backend to Heroku
deploy_backend_heroku() {
    print_status "Deploying backend to Heroku..."
    
    cd backend
    
    # Check for Heroku CLI
    if ! command -v heroku &> /dev/null; then
        print_error "Heroku CLI not found. Installing..."
        # Installation instructions
        case "$OSTYPE" in
            darwin*) 
                brew install heroku/brew/heroku
                ;;
            linux*)
                curl https://cli-assets.heroku.com/install.sh | sh
                ;;
            *)
                print_error "Please install Heroku CLI manually from https://devcenter.heroku.com/articles/heroku-cli"
                exit 1
                ;;
        esac
    fi
    
    # Login to Heroku
    print_status "Please login to Heroku..."
    heroku login
    
    # Create unique app name
    APP_NAME="genfree-backend-$(date +%s | tail -c 6)"
    print_status "Creating Heroku app: $APP_NAME"
    
    # Create app and addons
    heroku create $APP_NAME
    heroku addons:create heroku-postgresql:mini -a $APP_NAME
    heroku addons:create heroku-redis:mini -a $APP_NAME
    
    # Set environment variables
    print_status "Configuring environment variables..."
    heroku config:set DJANGO_SETTINGS_MODULE=genfree_backend.settings.production -a $APP_NAME
    heroku config:set SECRET_KEY="$(openssl rand -base64 32)" -a $APP_NAME
    heroku config:set DEBUG=False -a $APP_NAME
    heroku config:set FLUTTERWAVE_SECRET_KEY="$FLUTTERWAVE_SECRET" -a $APP_NAME
    heroku config:set FLUTTERWAVE_PUBLIC_KEY="$FLUTTERWAVE_PUBLIC" -a $APP_NAME
    heroku config:set FLUTTERWAVE_WEBHOOK_SECRET="$FLUTTERWAVE_WEBHOOK" -a $APP_NAME
    
    if [ ! -z "$EMAIL_USER" ]; then
        heroku config:set EMAIL_HOST_USER="$EMAIL_USER" -a $APP_NAME
        heroku config:set EMAIL_HOST_PASSWORD="$EMAIL_PASS" -a $APP_NAME
    fi
    
    if [ ! -z "$CUSTOM_DOMAIN" ]; then
        heroku config:set ALLOWED_HOSTS="$APP_NAME.herokuapp.com,$CUSTOM_DOMAIN" -a $APP_NAME
        heroku config:set CORS_ALLOWED_ORIGINS="https://$CUSTOM_DOMAIN" -a $APP_NAME
    fi
    
    # Initialize git if needed
    if [ ! -d ".git" ]; then
        git init
        git add .
        git commit -m "Initial commit"
    fi
    
    # Add Heroku remote
    heroku git:remote -a $APP_NAME
    
    # Deploy
    print_status "Deploying to Heroku..."
    git push heroku main
    
    # Run initial setup
    print_status "Running initial setup..."
    heroku run python manage.py migrate -a $APP_NAME
    heroku run python manage.py collectstatic --noinput -a $APP_NAME
    
    # Get backend URL
    BACKEND_URL="https://$APP_NAME.herokuapp.com"
    
    print_success "Backend deployed successfully!"
    print_success "Backend URL: $BACKEND_URL"
    print_success "Admin panel: $BACKEND_URL/admin/"
    print_success "API docs: $BACKEND_URL/api/schema/swagger-ui/"
    
    cd ..
}

# Function to deploy backend to Railway
deploy_backend_railway() {
    print_status "Deploying backend to Railway..."
    
    cd backend
    
    # Check for Railway CLI
    if ! command -v railway &> /dev/null; then
        print_status "Installing Railway CLI..."
        npm install -g @railway/cli
    fi
    
    # Login and deploy
    railway login
    railway init
    railway add postgresql
    railway add redis
    
    # Set environment variables
    railway variables set DJANGO_SETTINGS_MODULE=genfree_backend.settings.production
    railway variables set SECRET_KEY="$(openssl rand -base64 32)"
    railway variables set DEBUG=False
    railway variables set FLUTTERWAVE_SECRET_KEY="$FLUTTERWAVE_SECRET"
    railway variables set FLUTTERWAVE_PUBLIC_KEY="$FLUTTERWAVE_PUBLIC"
    railway variables set FLUTTERWAVE_WEBHOOK_SECRET="$FLUTTERWAVE_WEBHOOK"
    
    if [ ! -z "$EMAIL_USER" ]; then
        railway variables set EMAIL_HOST_USER="$EMAIL_USER"
        railway variables set EMAIL_HOST_PASSWORD="$EMAIL_PASS"
    fi
    
    # Deploy
    railway up
    
    # Get backend URL
    BACKEND_URL=$(railway status | grep "URL:" | awk '{print $2}')
    
    print_success "Backend deployed to Railway!"
    print_success "Backend URL: $BACKEND_URL"
    
    cd ..
}

# Function to deploy frontend
deploy_frontend() {
    case $PLATFORM_CHOICE in
        1)
            deploy_frontend_netlify
            ;;
        2)
            deploy_frontend_vercel
            ;;
        3)
            print_warning "Custom frontend deployment selected. Please configure manually."
            ;;
    esac
}

# Function to deploy frontend to Netlify
deploy_frontend_netlify() {
    print_status "Deploying frontend to Netlify..."
    
    # Update environment variables
    cat > .env << EOF
VITE_API_BASE_URL=$BACKEND_URL/api
VITE_WS_BASE_URL=${BACKEND_URL/https:/wss:}/ws
VITE_FLUTTERWAVE_PUBLIC_KEY=$FLUTTERWAVE_PUBLIC
EOF

    print_status "Updated .env with production settings"
    
    # Install dependencies and build
    npm install --legacy-peer-deps
    npm run build
    
    # Check for Netlify CLI
    if ! command -v netlify &> /dev/null; then
        print_status "Installing Netlify CLI..."
        npm install -g netlify-cli
    fi
    
    # Login and deploy
    print_status "Please login to Netlify..."
    netlify login
    
    print_status "Deploying to Netlify..."
    netlify deploy --prod --dir=dist
    
    print_success "Frontend deployed to Netlify!"
    print_warning "Don't forget to add environment variables in Netlify dashboard"
}

# Function to deploy frontend to Vercel
deploy_frontend_vercel() {
    print_status "Deploying frontend to Vercel..."
    
    # Update environment variables
    cat > .env << EOF
VITE_API_BASE_URL=$BACKEND_URL/api
VITE_WS_BASE_URL=${BACKEND_URL/https:/wss:}/ws
VITE_FLUTTERWAVE_PUBLIC_KEY=$FLUTTERWAVE_PUBLIC
EOF

    # Install dependencies and build
    npm install --legacy-peer-deps
    
    # Check for Vercel CLI
    if ! command -v vercel &> /dev/null; then
        print_status "Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    # Deploy
    print_status "Deploying to Vercel..."
    vercel --prod
    
    print_success "Frontend deployed to Vercel!"
}

# Function to create superuser
create_superuser() {
    print_status "Creating Django superuser..."
    
    case $PLATFORM_CHOICE in
        1)
            print_warning "Run this command to create superuser:"
            echo "heroku run python manage.py createsuperuser -a $APP_NAME"
            ;;
        2)
            railway run python manage.py createsuperuser
            ;;
    esac
}

# Function to test deployment
test_deployment() {
    print_status "Testing deployment..."
    
    if [ ! -z "$BACKEND_URL" ]; then
        print_status "Testing backend endpoints..."
        
        # Test API health
        if curl -s "$BACKEND_URL/health/" > /dev/null; then
            print_success "Backend health check passed"
        else
            print_warning "Backend health check failed - might still be starting up"
        fi
        
        # Test API endpoints
        if curl -s "$BACKEND_URL/api/" > /dev/null; then
            print_success "API endpoints accessible"
        else
            print_warning "API endpoints not yet accessible"
        fi
    fi
    
    print_success "Deployment testing completed"
}

# Function to show post-deployment instructions
show_post_deployment() {
    echo ""
    echo "🎉 DEPLOYMENT COMPLETE!"
    echo "======================"
    
    if [ ! -z "$BACKEND_URL" ]; then
        echo ""
        echo "🔗 Backend URLs:"
        echo "   API Root: $BACKEND_URL/api/"
        echo "   Admin Panel: $BACKEND_URL/admin/"
        echo "   API Docs: $BACKEND_URL/api/schema/swagger-ui/"
    fi
    
    echo ""
    echo "📋 Next Steps:"
    echo "1. Create Django superuser account"
    echo "2. Add environment variables to frontend hosting (if not done)"
    echo "3. Test donation flow end-to-end"
    echo "4. Configure custom domain (if desired)"
    echo "5. Set up monitoring and analytics"
    
    echo ""
    echo "🔧 Important Environment Variables for Frontend:"
    echo "   VITE_API_BASE_URL=$BACKEND_URL/api"
    echo "   VITE_FLUTTERWAVE_PUBLIC_KEY=$FLUTTERWAVE_PUBLIC"
    
    if [ ! -z "$CUSTOM_DOMAIN" ]; then
        echo ""
        echo "🌐 Custom Domain Setup:"
        echo "   Configure DNS to point $CUSTOM_DOMAIN to your hosting provider"
        echo "   Update CORS settings in backend if needed"
    fi
    
    echo ""
    echo "📞 Support:"
    echo "   Check logs if issues arise"
    echo "   Test all functionality thoroughly"
    echo "   Monitor performance and uptime"
    
    echo ""
    print_success "Your GenFree Network platform is now live! 🙏"
}

# Main execution flow
main() {
    check_prerequisites
    collect_deployment_info
    deploy_backend
    deploy_frontend
    test_deployment
    show_post_deployment
}

# Run main function
main