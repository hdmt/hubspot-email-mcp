#!/usr/bin/env node
import { HubSpotEmailMCPServer } from './server.js';

const accessToken = process.env.HUBSPOT_ACCESS_TOKEN;

if (!accessToken) {
  console.error('Error: HUBSPOT_ACCESS_TOKEN environment variable is required');
  process.exit(1);
}

const server = new HubSpotEmailMCPServer(accessToken);
server.start().catch(console.error);
