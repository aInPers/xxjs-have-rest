基于react + tauri制作的信职请假系统

具体工具要求请自行查看tauri相关的android与ios前置需求

快速开始
`npm install`
`npm run tauri dev`

构建
1. 安卓
`npm run tauri android init`
`npm run tauri android build`

2. IOS(只能在MacOS上构建)
`npm run tauri ios init`
`npm run tauri ios build`

可设置如下
1. 请假人
2. 请假开始
3. 请假结束
4. 请假天数(自动推算)
5. 开始节次
6. 结束节次
7. 请假类型
8. 请假原因
9. 是否住校
10. 证明图片
11. 审批人是否批准
  1. 家长
  2. 班主任
  3. 学生科
  4. 领导

已兼容Android, IOS, Windows

MIT 协议
