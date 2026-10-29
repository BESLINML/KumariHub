# Firebase share metadata

The Hosting rewrite sends non-static routes to `shareMetadata`, which adds business-specific Open Graph and Twitter tags to the app shell before returning it.

1. Set `API_URL` in `functions/.env.<firebase-project-id>` to the public backend base URL.
2. Install the function dependency with `npm install --prefix functions`.
3. Build the frontend with `npm --prefix frontend run build`.
4. Deploy with `firebase deploy --only functions,hosting`.

Set `ADMIN_API_TOKEN`, `RAZORPAY_KEY_ID`, and `RAZORPAY_KEY_SECRET` in the backend environment. Set `VITE_RAZORPAY_KEY_ID` and `VITE_API_URL` in the frontend build environment.
