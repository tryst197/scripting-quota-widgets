import { Navigation, Script, Text } from 'scripting'
async function main() {
  await Navigation.present({ element: <Text>测试成功：脚本页面可以显示</Text> })
  Script.exit()
}
main()
