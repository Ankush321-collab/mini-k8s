import {Queue} from 'bullmq'

export const jobdispatch=new Queue('job-dispatcher',{
    connection:{
        host:'localhost',
        port:6379
    }
})

export const jobscrischeduler=new Queue('job-cri-scheduler',{
    connection:{
        host:'localhost',
        port:6379
    }
})

export const jobwatcherscheduler=new Queue('job-watcher-scheduler',{
    connection:{
        host:'localhost',
        port:6379
    }
})