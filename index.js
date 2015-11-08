var http = require('http')

var server1 = "46.101.225.132", server2 = "46.101.131.62"
var primary = server1

http.createServer(function(req, res){

	fw(req, res, false)

}).listen(9000)

var fw = function(req, res, retry){
	var fw_req = http.request({
		hostname: primary,
		port: 80,
		path: req.url, // includes GET params
		method: req.method,
		headers: res.headers,
	}, function(fw_res){
		
		if( fw_res.statusCode < 500 ) {

			sync_streams(fw_res, res)

		} else {
			//change primary and retry
			primary = (primary === server1) ? server2 : server1
			fw(req, res, true)
		}
		
	})

	if (retry) { // req stream is already ended so i pipe in into fw_req
		req.pipe(fw_req)
		fw_req.end()
	}
	else{ // req strem is not ended so i sync fw_res with it
		sync_streams(req, fw_req)
	}

}
var sync_streams = function(sin, sout){
	sin.on('data', function(chuck){
		sout.write(chuck)
	})

	sin.on('end', function(){
		sout.end()
	})
}