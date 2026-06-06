import {jobdispatch, jobscrischeduler, jobwatcherscheduler} from  './queue/queue.js'
import {jobdispatchworker,jobcriworker, jobwatcher} from './queue/worker.js'


async function init(){
    Promise.all([
        jobdispatch.upsertJobScheduler('job-dispatcher-scheduler',{
            every:2000,

        }),
        jobscrischeduler .upsertJobScheduler('job-cri-scheduler-scheduler',{
            every:5000,
 } ),
 jobwatcherscheduler.upsertJobScheduler('job-watcher-scheduler',{
        every:10000,

 }
 ),
 

    ])
}
init()