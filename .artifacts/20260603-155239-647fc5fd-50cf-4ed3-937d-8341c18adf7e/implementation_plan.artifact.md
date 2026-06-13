# Prepare Laravel for Deployment in `.Laravel/deploy`

This plan outlines the steps to prepare a production-ready version of the Laravel application and place it in the `.Laravel/deploy` directory.

## Proposed Changes

### Deployment Preparation

I will create a deployment directory and populate it with the necessary files, optimized for a production environment.

#### [NEW] .Laravel/deploy
- This directory will contain the production-ready application.

### Workflow

1. **Create Destination Directory**:
   - Create `C:/Program1/Projects/Shuttle/.Laravel/deploy`.

2. **Copy Files**:
   - Copy the contents of `C:/Program1/Projects/Shuttle/Laravel` to the destination.
   - Exclude the following to keep the deployment package clean:
     - `.git`
     - `node_modules`
     - `vendor` (will be re-installed)
     - `tests`
     - `storage/logs/*`
     - `storage/framework/views/*`
     - `storage/framework/sessions/*`
     - `storage/framework/cache/*`

3. **Install Dependencies (in `.Laravel/deploy`)**:
   - Run `composer install --no-dev --optimize-autoloader`.
   - Run `npm install` and `npm run build`.

4. **Production Optimization**:
   - Run `php artisan config:cache`.
   - Run `php artisan route:cache`.
   - Run `php artisan view:cache`.
   - Run `php artisan event:cache`.

5. **Permissions**:
   - Ensure `storage` and `bootstrap/cache` are writable.

## Verification Plan

### Manual Verification
- Verify that the `.Laravel/deploy` directory exists and contains the expected files.
- Check that `vendor` exists and contains only production dependencies.
- Verify that `public/build` contains the compiled assets.
- Verify that the cache files exist in `bootstrap/cache`.

### Automated Tests
- Run `php artisan about` in the deploy directory to confirm the environment and optimization status.
