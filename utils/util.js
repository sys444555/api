function formatTime(date) {
	var year = date.getFullYear()
	var month = date.getMonth() + 1
	var day = date.getDate()
	var hour = date.getHours()
	var minute = date.getMinutes()
	var second = date.getSeconds()
	return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
	n = n.toString()
	return n[1] ? n : '0' + n
}

//生成订单号
const orderId = oId => {
  var orderId = (Math.floor(Math.random() * 999999999999999999))+"";
  orderId = orderId.length == 18 ? parseInt(orderId) : parseInt(orderId + 100000000000000000)
  return orderId;
}

module.exports = {
	formatTime: formatTime,
  orderId: orderId
}

