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
    },
};

export default function () {
    var url = 'https://predscaling01.natzkalabs.com/loads/matrixinverse?msize=1000';     
    http.get(url);
}
