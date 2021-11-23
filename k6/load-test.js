import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
    scenarios: {
        constant_rate_low: {
            executor: 'constant-arrival-rate',
            rate: 0.1,
            timeUnit: '1s',
            duration: '5m',
            preAllocatedVUs: 100,
        },

        constant_rate_high: {
            executor: 'constant-arrival-rate',
            startTime: '6m',
            rate: 1,
            timeUnit: '1s',
            duration: '5m',
            preAllocatedVUs: 100,
        },

        ramping_rate: {
            executor: 'ramping-arrival-rate',  
            startTime: '15m',    
            startRate: 0,      
            timeUnit: '1s',      
            preAllocatedVUs: 100,      
            maxVUs: 100,      
            stages: [      
              { target: 10, duration: '10m' },         
            ],
      
          },
    },
};

export default function () {
    var url = 'https://predscaling01.natzkalabs.com/loads/matrixinverse?msize=1000';     
    http.get(url);
}
