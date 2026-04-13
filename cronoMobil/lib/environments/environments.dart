class Environments {
  api() {
    // LAN
    // const apiurlprefix = 'http://192.168.55.27:5130/api/';
    // exxalink
    // const apiurlprefix = 'http://104.243.44.89:4003/api/';
    // exxalink https DNS
    const apiurlprefix = 'https://cmsbackerp.cashmachserv.com/api/';

    return apiurlprefix;
  }

  apiTicket() {
    const apiurlprefixTicket = 'https://cmsbackticket.cashmachserv.com/api/';
    return apiurlprefixTicket;
  }

  apiHub() {
    // LAN
    // const apiurlprefix = 'http://192.168.55.27:5130/';
    // exxalink
    const apiurlprefix = 'https://cmsbackerp.cashmachserv.com/';
    return apiurlprefix;
  }

  brevoApi() {
    const brevoapi = 'http://104.243.44.89:4004/';
    return brevoapi;
  }
}
