# 🌐 Custom Domain Deployment Guide

## Overview

Configuring your infrastructure to use:
- **Frontend**: `https://qa.finishlinebyner.com` (Amplify)
- **Backend**: `https://api-qa.finishlinebyner.com` (Elastic Beanstalk)

Both with free ACM SSL certificates and automatic DNS validation.

---

## What This Does

1. **Creates 2 ACM Certificates** (free):
   - `qa.finishlinebyner.com` for Amplify
   - `api-qa.finishlinebyner.com` for Elastic Beanstalk

2. **Validates certificates automatically** via Route 53 DNS records

3. **Configures Elastic Beanstalk**:
   - Adds HTTPS listener on port 443
   - Attaches certificate
   - Redirects HTTP → HTTPS
   - Creates CNAME: `api-qa.finishlinebyner.com` → EB environment

4. **Configures Amplify**:
   - Connects `qa.finishlinebyner.com` to your app
   - Uses custom domain for deployments
   - Backend URL becomes `https://api-qa.finishlinebyner.com`

5. **Updates Route 53**:
   - Replaces existing `qa.finishlinebyner.com` record
   - Creates `api-qa.finishlinebyner.com` record

---

## Prerequisites

✅ You have access to `finishlinebyner.com` Route 53 hosted zone  
✅ Okay with replacing current `qa.finishlinebyner.com` DNS record  
✅ All Terraform secrets are set  
✅ Backend is running on Elastic Beanstalk  

---

## Deployment Steps

### **Step 1: Set Required Variables** (1 minute)

```bash
cd infrastructure/environments/production

# Enable HTTPS and custom domains
export TF_VAR_enable_https=true
export TF_VAR_use_custom_domain=true

# Your existing secrets should already be set:
# TF_VAR_github_access_token
# TF_VAR_github_repository  
# TF_VAR_db_master_password
# etc...
```

**Note:** The domain names are already set as defaults in `variables.tf`:
- `frontend_domain = "qa.finishlinebyner.com"`
- `backend_domain = "api-qa.finishlinebyner.com"`
- `hosted_zone_name = "finishlinebyner.com"`

If you want different names, you can override:
```bash
export TF_VAR_frontend_domain="qa.finishlinebyner.com"
export TF_VAR_backend_domain="api-qa.finishlinebyner.com"
```

### **Step 2: Review Changes** (2 minutes)

```bash
terraform plan
```

**Expected changes:**

**NEW Resources:**
- `module.dns[0].aws_acm_certificate.frontend` - Certificate for qa.finishlinebyner.com
- `module.dns[0].aws_acm_certificate.backend` - Certificate for api-qa.finishlinebyner.com
- `module.dns[0].aws_route53_record.frontend_cert_validation[...]` - Validation records
- `module.dns[0].aws_route53_record.backend_cert_validation[...]` - Validation records
- `module.dns[0].aws_acm_certificate_validation.frontend` - Wait for validation
- `module.dns[0].aws_acm_certificate_validation.backend` - Wait for validation
- `module.dns[0].aws_route53_record.backend` - CNAME for api-qa → EB
- `module.frontend.aws_amplify_domain_association.main[0]` - Amplify domain config

**UPDATED Resources:**
- `module.elasticbeanstalk.aws_elastic_beanstalk_environment.main` - Add HTTPS listener + certificate
- `module.frontend.aws_amplify_app.frontend` - Update backend URL to https://api-qa...
- `module.frontend.aws_amplify_branch.main` - Update environment variables

**REPLACED Resources:**
- Any existing Route 53 record for `qa.finishlinebyner.com` (will point to Amplify instead)

###  **Step 3: Apply Configuration** (15-20 minutes)

```bash
terraform apply
```

Type `yes` when prompted.

**Timeline:**
1. **0-1 min**: Create ACM certificates
2. **0-1 min**: Create Route 53 validation records
3. **2-5 min**: Wait for ACM certificate validation (DNS propagation)
4. **5-8 min**: Update Elastic Beanstalk environment (add HTTPS listener)
5. **2-3 min**: Configure Amplify custom domain
6. **Total: 10-17 minutes**

**You'll see output like:**
```
module.dns[0].aws_acm_certificate.frontend: Creating...
module.dns[0].aws_acm_certificate.backend: Creating...
module.dns[0].aws_route53_record.frontend_cert_validation["qa.finishlinebyner.com"]: Creating...
module.dns[0].aws_acm_certificate_validation.frontend: Creating...
module.dns[0].aws_acm_certificate_validation.frontend: Still creating... [1m0s elapsed]
module.dns[0].aws_acm_certificate_validation.frontend: Still creating... [2m0s elapsed]
...
module.dns[0].aws_acm_certificate_validation.frontend: Creation complete
module.elasticbeanstalk.aws_elastic_beanstalk_environment.main: Modifying...
...
```

---

## **Step 4: Verify Backend HTTPS** (2 minutes)

After terraform completes:

```bash
# Get backend URL
terraform output backend_api_url
# Should show: https://api-qa.finishlinebyner.com

# Test it
curl https://api-qa.finishlinebyner.com/health
# Should return: {"status":"healthy"}

# Verify HTTP redirects to HTTPS
curl -I http://api-qa.finishlinebyner.com/health
# Should return: 301 redirect to https://
```

---

## **Step 5: Configure Amplify Domain** (5-10 minutes)

After Terraform applies, Amplify needs to verify you own the domain.

**Get Amplify Console URL:**
```bash
terraform output amplify_console_url
```

**In Amplify Console:**
1. Click **"Domain management"** (left sidebar)
2. You should see `qa.finishlinebyner.com` listed
3. Status will show **"Pending verification"** or **"Creating"**
4. Amplify will show you DNS records to add

**Amplify provides 2 options:**

**Option A: Automatic (Amplify manages DNS)**
- Amplify will show CNAME records
- You need to add these to Route 53
- Amplify will then manage the domain

**Option B: Manual (We already created DNS records via Terraform)**
- We might need to manually add the CNAME Amplify provides

Let me update the DNS module to also create the Amplify CNAME:

Actually, the `aws_amplify_domain_association` resource with `wait_for_verification = true` should handle this automatically. Amplify will update Route 53 for us.

---

## **Step 6: Wait for Amplify Domain Verification** (5-10 minutes)

Amplify needs to verify domain ownership and provision SSL certificate:

**Monitor progress:**
- In Amplify Console → Domain management
- Status will change: Pending → Verifying → Available
- This takes 5-10 minutes

**When complete:**
- Status shows "Available" with green checkmark ✅
- SSL certificate is provisioned
- `qa.finishlinebyner.com` points to your Amplify app

---

## **Step 7: Trigger Frontend Rebuild** (5 minutes)

After domain is configured, rebuild frontend with new backend URL:

```bash
git commit --allow-empty -m "Rebuild with custom domain and HTTPS backend"
git push origin amplify-test
```

Watch the build in Amplify Console - it will now use `https://api-qa.finishlinebyner.com` as the backend URL.

---

## **Step 8: Test Everything** (5 minutes)

### **Test Frontend:**
```bash
# Visit your custom domain
open https://qa.finishlinebyner.com
```

### **Verify in Browser:**
1. Open browser console (F12)
2. Go to Network tab
3. Try to log in
4. **Check requests:**
   - ✅ Should go to `https://api-qa.finishlinebyner.com` (not HTTP!)
   - ✅ No mixed content errors
   - ✅ No CORS errors
   - ✅ Login should work!

### **Test Backend Directly:**
```bash
curl https://api-qa.finishlinebyner.com/health
# Should return: {"status":"healthy"}
```

---

## **Troubleshooting**

### **"Certificate validation is taking too long"**
- **Wait**: Can take up to 30 minutes (usually 5-10)
- **Check**: Route 53 validation records were created
- **Verify**: You own the hosted zone `finishlinebyner.com`

### **"Amplify domain verification failed"**
- **Check**: Amplify Console → Domain management for error details
- **Verify**: No conflicting DNS records
- **Try**: Remove and re-add domain in Amplify Console

### **"Backend still uses HTTP"**
- **Check**: `terraform output backend_api_url` shows `https://`
- **Verify**: EB environment has HTTPS listener configured
- **Test**: `curl https://api-qa.finishlinebyner.com/health`

### **"Frontend still can't reach backend"**
- **Check**: Browser console shows requests to HTTPS backend
- **Verify**: CORS allows `qa.finishlinebyner.com` (it does in your code)
- **Check**: Both certificates are validated

---

## **What Gets Replaced**

⚠️ **Existing DNS record for `qa.finishlinebyner.com` will be replaced**

If you have services using `qa.finishlinebyner.com`, they will break. Based on your message, you said you don't care about that environment, so this should be fine.

**Before applying:**
- Note what `qa.finishlinebyner.com` currently points to
- Ensure no critical services depend on it
- You can always revert by changing the DNS record back

---

## **Cost Impact**

**ACM Certificates**: FREE  
**Route 53 hosted zone**: ~$0.50/month (you already have this)  
**Route 53 queries**: ~$0.40/month per million queries  
**HTTPS on ALB**: $0 (no additional charge)  

**Total additional cost**: ~$0-1/month

---

## **Summary of Changes**

| Resource | Before | After |
|----------|--------|-------|
| **Frontend URL** | `https://infrastructure.d1dbsw6h71s5ko.amplifyapp.com` | `https://qa.finishlinebyner.com` |
| **Backend URL** | `http://finishline-production-env.eba-qpwwtuzt.us-east-1.elasticbeanstalk.com` | `https://api-qa.finishlinebyner.com` |
| **Frontend SSL** | Amplify default | ACM cert for `qa.finishlinebyner.com` |
| **Backend SSL** | None (HTTP only) | ACM cert for `api-qa.finishlinebyner.com` |
| **Mixed content** | ❌ Error | ✅ No error |
| **CORS** | ❌ localhost:3001 | ✅ Works |

---

## **Ready to Deploy?**

```bash
# 1. Set variables
export TF_VAR_enable_https=true
export TF_VAR_use_custom_domain=true

# 2. Preview
terraform plan

# 3. Apply
terraform apply

# 4. Wait for completion (~15-20 min)
# 5. Test at https://qa.finishlinebyner.com
```

**Total time**: ~25-30 minutes (mostly waiting for certificate validation and EB environment update)

---

**Any questions before you run `terraform apply`?** 🚀
