import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
    scenarios: {
        open_model: {
            executor: 'constant-arrival-rate',
            rate: 10,
            timeUnit: '1s',
            duration: '10m',
            preAllocatedVUs: 100,
        },

        open_model_ramp: {
            executor: 'ramping-arrival-rate',  
            startTime: '20m',    
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
