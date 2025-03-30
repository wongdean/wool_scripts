 /* WPS Office 解锁会员 2024版
* 支持两个接口:
* - https://personal-bus.wps.cn/activity/member_badges/v1/getMemberInfo
* - https://120.46.147.18/api/vas/privileges
*/

var url = $request.url;
var body = JSON.parse($response.body);

if (url.indexOf('member_badges/v1/getMemberInfo') !== -1) {
  // 处理会员信息接口
  body = {
    "result": "ok",
    "msg": "",
    "data": [
      {
        "sku": "vip_pro",
        "expire_time": "2099-12-31T23:59:59+08:00",
        "user_id": 1556540326,
        "member_type": "vip_pro"
      }
    ]
  };
} else if (url.indexOf('/api/vas/privileges') !== -1) {
  // 处理权限接口
  // 设置很长的过期时间
  const far_future = 4102415999; // 2099-12-31 23:59:59
  const now = Math.floor(Date.now() / 1000);
  
  // 遍历所有权限并设置不过期
  if (body.privileges) {
    Object.keys(body.privileges).forEach(key => {
      body.privileges[key].expire_at = far_future;
      body.privileges[key].effect_at = now;
      body.privileges[key].total = -1; // 无限次数
      body.privileges[key].time = -1; // 无限时间
      
      // 一些特殊权限保留原有的数值设置
      if (["cloud_space", "filesize_limit", "batch_download_file_size", 
           "batch_download_file_number", "user_free_group_member_number", 
           "sync_folder", "share_visit_gt3"].includes(key)) {
        // 这些项保留原始的total值，但设置永不过期
        body.privileges[key].time = body.privileges[key].time;
        body.privileges[key].total = body.privileges[key].total;
      }
    });
  }
  
  // 更新用户信息
  if (body.userinfo) {
    body.userinfo.expire_at = far_future;
    body.userinfo.update_at = now;
    body.userinfo.member_id = 40; // 超级会员
    body.userinfo.member_array = [40, 20, 12]; // 包含所有会员类型
  }
}

$done({body: JSON.stringify(body)});