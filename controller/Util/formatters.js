exports.FormatTime = function(time, msCount) {
	if (!msCount) msCount = 3;
	var ms = time.toString().substring(time.toString().length-msCount);
	while (ms.length < msCount)
		ms = '0'+ms;
	var sc = Math.floor(time/1000);
	var mn = Math.floor(sc/60);
	sc -= mn*60;
	sc = sc.toString();
	if (sc.length < 2)
		sc = '0'+sc;
	return mn+':'+sc+'.'+ms;
}