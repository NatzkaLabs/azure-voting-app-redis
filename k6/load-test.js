import http from 'k6/http';
import { sleep } from 'k6';
import exec from 'k6/execution';

export const options = {
    vus: 1,
    duration: '10m',
};

function poisson_process(rr, t_last_req) {
    let u = Math.random();
    let tim1 = t_last_req;

    // Find current segment k
    let k = 0;
    for (let i = 0; i < rr.length; i++) {
        k++;
        if (rr[k].t > tim1) {break;}
    }
    console.log(`current segment: ${k}`);


    let Ti = 0.;
    while (true) {
        let tkm1 = rr[k-1].t;
        let lkm1 = rr[k-1].l;
        let tk = rr[k].t;
        let lk = rr[k].l;
        let ak = (lk-lkm1) / (tk-tkm1);
        let bk = -ak * tkm1 + lkm1;

        console.log(`current rate: ${ak*tim1+bk}`);

        let uk = 1 - Math.exp(-(ak/2)*(tk**2 - tim1**2)- bk*(tk-tim1));

        if (u <= uk) {
            if (ak != 0.) {
                Ti = (-bk+Math.sqrt(bk**2 + ak**2*tim1**2 +
                       2*ak*bk*tim1 - 2*ak*Math.log(1-u))) / ak;
            } else {
                Ti = tim1 - Math.log(1-u) / bk;
            }
            break;
        } else {
            u = (u - uk) / (1-uk);
            tim1 = tk;
            k = k + 1;
        }
    }

    return Ti - t_last_req
}

function randomExponential(rate, randomUniform) {
    // http://en.wikipedia.org/wiki/Exponential_distribution#Generating_exponential_variates
    rate = rate || 1;

    // Allow to pass a random uniform value or function
    // Default to Math.random()
    let U = randomUniform;
    if (typeof randomUniform === 'function') U = randomUniform();
    if (!U) U = Math.random();

    return -Math.log(U)/rate;
}

export function setup() {
  // Load from file tne rate

    // t in seconds, rate l in requests/seconds
    const minutes = 1;
    // Over 2 hours cycle
    const request_rate = [
      {
        "t": 0*minutes,
        "l": 0
      },
      {
        "t": 20*minutes,
        "l": 20
      },
      {
        "t": 50*minutes,
        "l": 20
      },
      {
        "t": 60*minutes,
        "l": 5
      },
      {
        "t": 80*minutes,
        "l": 7
      },
      {
        "t": 100*minutes,
        "l": 15
      },
      {
        "t": 120*minutes,
        "l": 0
      }
    ];

    return request_rate
}



let last_req = 0. // Time of last request [ms]
export default function (data) {
    last_req = (new Date() - new Date(exec.scenario.startTime))
    let request_rate = data;
    //let url = 'https://predscaling01.natzkalabs.com/loads/matrixinverse?msize=1000';
    //let url = 'http://localhost:8080';
    let url = 'https://predscaling01.natzkalabs.com';
    http.get(url);

    let new_req_time = poisson_process(request_rate, last_req/1000.)

     // TODO use Date().gettime()
    console.log(`last_req: ${last_req/1000.} s`);
    let calculations_time = (new Date() - new Date(last_req) - new Date(exec.scenario.startTime))/1000.
    console.log(`calculations_time: ${calculations_time} s`);
    sleep(new_req_time - calculations_time)
}
