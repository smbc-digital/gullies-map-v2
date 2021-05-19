import fetch from 'cross-fetch'
let target_url

const getTargetUrl = () => {
    if(!target_url){
        target_url = generateTargetUrl()
    }

    return target_url
}

const generateTargetUrl = () => {
    if (window.location.hostname.includes('localhost')) {
        return  'http://localhost:57726'
    }
    else if (window.location.hostname.includes('int'))
    {
        return  'https://int-dts.smbcdigital.net'
    }
    else if (window.location.hostname.includes('qa'))
    {
        return  'https://qa-dts.smbcdigital.net'
    }
    else if (window.location.hostname.includes('staging'))
    {
        return  'https://stage-dts.smbcdigital.net'
    }
    else 
    {
        return  'https://myaccount.stockport.gov.uk'
    }
}

const fetchWithTimeout = (url, options, timeout = 10000) => {
    return Promise.race([
        fetch(url, options),
        new Promise((resolve, reject) => {
            setTimeout(() => reject(new Error('Timeout')), timeout)
        })
    ])
}

export {
    fetchWithTimeout,
    getTargetUrl
}