import { useState, Navigation, NavigationStack, Script, Form, Section, Text, TextField, SecureField, Button, Storage, Keychain, Widget } from 'scripting'
import { DEFAULT_URLS } from './model'
function Settings() {
 const [ai,setAI]=useState(Storage.get<string>('quota.ai.url') ?? DEFAULT_URLS.ai)
 const [server,setServer]=useState(Storage.get<string>('quota.server.url') ?? DEFAULT_URLS.server)
 const [aiToken,setAIToken]=useState(''), [serverToken,setServerToken]=useState('')
 const [message,setMessage]=useState('令牌留空时保留原值；使用删除按钮可清除。')
 function save() {
  if ((ai && !/^https:\/\//i.test(ai.trim())) || (server && !/^https:\/\//i.test(server.trim()))) {setMessage('地址必须以 https:// 开头');return}
  const ok1=Storage.set('quota.ai.url',ai.trim()), ok2=Storage.set('quota.server.url',server.trim())
  const ok3=!aiToken || Keychain.set('quota.ai.token',aiToken.trim()), ok4=!serverToken || Keychain.set('quota.server.token',serverToken.trim())
  if (ok1) Storage.remove('quota.ai.cache')
  if (ok2) Storage.remove('quota.server.cache')
  if (ok3) setAIToken(''); if (ok4) setServerToken('')
  setMessage(ok1 && ok2 && ok3 && ok4 ? '已保存，请关闭本页并返回桌面。' : '部分保存失败，请重试。'); Widget.reloadAll()
 }
 return <NavigationStack><Form navigationTitle="额度组件设置">
  <Section>
  <Text>默认使用公开数据地址；如接口需要认证，可填写 Bearer 令牌。令牌不会显示或写入脚本。</Text>
  </Section>
  <Section header={<Text>AI</Text>}>
  <TextField title="AI 地址" value={ai} onChanged={setAI} />
  <SecureField title="AI 令牌" value={aiToken} onChanged={setAIToken} />
  <Button title="删除 AI 令牌" action={()=>{const ok=Keychain.remove('quota.ai.token');if(ok) Storage.remove('quota.ai.cache');setAIToken('');setMessage(ok ? 'AI 令牌已清除' : 'AI 令牌删除失败，请重试');Widget.reloadAll()}} />
  </Section>
  <Section header={<Text>节点</Text>}>
  <TextField title="节点地址" value={server} onChanged={setServer} />
  <SecureField title="节点令牌" value={serverToken} onChanged={setServerToken} />
  <Button title="删除节点令牌" action={()=>{const ok=Keychain.remove('quota.server.token');if(ok) Storage.remove('quota.server.cache');setServerToken('');setMessage(ok ? '节点令牌已清除' : '节点令牌删除失败，请重试');Widget.reloadAll()}} />
  </Section>
  <Section>
   <Button title="保存" action={save} />
   <Text>{message}</Text>
  </Section>
 </Form></NavigationStack>
}
async function main(){await Navigation.present({element:<Settings/>});Script.exit()}
void main()
