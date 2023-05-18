import { Component, OnInit } from '@angular/core';

import { Subscription, map, timer } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { interval } from 'rxjs';

const envClientConfig = { ANGULR_API_GET_PLANS: '/api/getPlans',  ANGULR_API_GET_STATS: '/api/getStats', ANGULR_API_GET_URLS: '/api/getURLs' }

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'travels-analytics';
  timerSubscription: Subscription;
  http: HttpClient;
  plans;
  stats;
  updatedValues = {
    "Green App": {hits:"", value:""},
    "Red App": {hits:"", value:""},
    "Blue App": {hits:"", value:""}
  };


  constructor( http: HttpClient) {
      this.http = http;
  }

  ngOnInit() {
    this.getPlans()
  }

  getPlans() {
    return this.http.get<any>(envClientConfig.ANGULR_API_GET_PLANS).subscribe(plans => {
      this.plans = plans
      console.log("this.urls", this.plans)
      this.alterPlans();
      this.initStats()
    })
  }

  alteredPlan = new Array;

  initStats() {
    interval(500).subscribe(x => {
      this.getStats();
    });
  }

  getStats() {
    return this.http.get<any>(envClientConfig.ANGULR_API_GET_STATS).subscribe(stats => {
      this.stats = stats
      console.log("this.stats", this.stats)
      this.getBilledAmount()
      console.log("this.updatedValues", this.updatedValues)
    })
  }




  getBilledAmount(){
    this.stats.applications.forEach((app) => {
      let val = this.getIndividualBilledAmount(app.value)
      this.updatedValues[app.name] = {amount:val, hits:app.value};

    })

  }

  getIndividualBilledAmount(usage){

    let billedAmount = 0
    let pricer = this.alteredPlan;
    for(var x=0; x < pricer.length; x++){
      if(usage >= pricer[x].low && usage <= pricer[x].high){
          billedAmount = billedAmount + ((pricer[x].high - pricer[x].low + 1) * pricer[x].rate)
      }
      else if(usage > pricer[x].low){
          billedAmount = billedAmount + ((usage - pricer[x].low + 1) * pricer[x].rate)
      }
    }
    return billedAmount;
  }


  private alterPlans() {
    this.plans.pricing_rules.pricing_rule.forEach((plan) => {
      let tempPlan = {
        rate: plan.cost_per_unit[0],
        low: plan.min[0],
        high: plan.max[0],
      }
      this.alteredPlan.push(tempPlan)
    })
    console.log("this.simplifiedPlan", this.alteredPlan)

  }


  getFinalResults() {
    this.stats.applications.forEach((application) => {
      const { name, value } = application;
      let adjustedValue = Number(value);

      if (adjustedValue > 10 && adjustedValue <= 20) {
        adjustedValue = 10 + 3 * (adjustedValue - 10);
      } else if (adjustedValue > 20) {
        adjustedValue = 10 + 3 * (20 - 10) + 10 * (adjustedValue - 20);
      }

      this.updatedValues[name] = adjustedValue;
    });
  }
}
