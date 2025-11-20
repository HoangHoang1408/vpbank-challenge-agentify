#!/bin/bash
# Script to create customers that satisfy ALL EmailType conditions
# - BIRTHDAY: Birthday is today
# - CARD_RENEWAL: Has cards needing renewal within 30 days  
# - SEGMENT_MILESTONE: Account anniversary (1/3/5 years) OR high-tier segment

npx ts-node src/data/scripts/create_eligible_customers.ts

