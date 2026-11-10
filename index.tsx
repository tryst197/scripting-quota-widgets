import { useState, Navigation, NavigationStack, Script, VStack, Text, TextField, SecureField, Button, Storage, Keychain, Widget } from 'scripting'
function Settings() {
 const [ai,setAI]=useState(Storage.get<string>('quota.ai.url') || '')
 const [server,setServer]=useState(Storage.get<string>('quota.server.url') || '')
 const [aiToken,setAIToken]=useState(''), [serverToken,setServerToken]=useState('')
 const [message,setMessage]=useState('令牌留空时保留原值；使用删除按钮可清除。')
 function save() {
  if ((ai && !/^https:\/\//i.test(ai.trim())) || (server && !/^https:\/\//i.test(server.trim()))) {setMessage('地址必须以 https:// 开头');return}
  if ((Storage.get<string>('quota.ai.url') || '') !== ai.trim()) Storage.remove('quota.ai.cache')
  if ((Storage.get<string>('quota.server.url') || '') !== server.trim()) Storage.remove('quota.server.cache')
  const ok1=Storage.set('quota.ai.url',ai.trim()), ok2=Storage.set('quota.server.url',server.trim())
  const ok3=!aiToken || Keychain.set('quota.ai.token',aiToken.trim()), ok4=!serverToken || Keychain.set('quota.server.token',serverToken.trim())
  setAIToken('');setServerToken('');setMessage(ok1 && ok2 && ok3 && ok4 ? '已保存，请关闭本页并返回桌面。' : '部分保存失败，请重试。'); void Widget.reloadAll()
 }
 return <NavigationStack><VStack padding={16} spacing={12} navigationTitle="额度组件设置">
  <Text>输入两个 HTTPS 数据地址与各自的 Bearer 令牌。令牌不会显示或写入脚本。</Text>
  <TextField title="AI 地址" value={ai} onChanged={setAI} />
  <SecureField title="AI 令牌" value={aiToken} onChanged={setAIToken} />
  <TextField title="节点地址" value={server} onChanged={setServer} />
  <SecureField title="节点令牌" value={serverToken} onChanged={setServerToken} />
  <Button title="保存" action={save} />
  <Button title="删除 AI 令牌" action={()=>{Keychain.remove('quota.ai.token');setAIToken('');setMessage('AI 令牌已清除')}} />
  <Button title="删除节点令牌" action={()=>{Keychain.remove('quota.server.token');setServerToken('');setMessage('节点令牌已清除')}} />
  <Text>{message}</Text>
 </VStack></NavigationStack>
}
async function main(){await Navigation.present({element:<Settings/>});Script.exit()}
void main()
