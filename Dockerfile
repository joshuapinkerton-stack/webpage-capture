# Use Playwright Chrome base image (includes Chromium + system deps)
FROM apify/actor-node-playwright-chrome:20

# Copy package files first (for layer caching)
COPY package.json package-lock.json* ./

# Install npm dependencies
RUN npm --quiet set progress=false \
  && npm install --omit=dev --omit=optional

# Copy source code (node_modules already installed above, won't be overwritten)
COPY . ./

# Set the command to run the actor
CMD ["node", "src/main.js"]
