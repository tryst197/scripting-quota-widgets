import { VStack, HStack, Text, Spacer, Button, Widget, Script } from 'scripting'
import { load, rows, Row, Kind } from './model'
import { Refresh } from './app_intents'
function color(row: Row) { return row.unlimited ? 'systemGreen' : row.value === null ? 'secondaryLabel' : row.value < 15 ? 'systemRed' : row.value < 35 ? 'systemOrange' : 'systemGreen' }
function Line({row, large}: {row:Row,large:boolean}) {
 return <HStack spacing={3}>
  <Text font={large ? 12 : 10} lineLimit={1} foregroundStyle="label">{row.name}</Text><Spacer />
  {large && row.detail ? <Text font={9} lineLimit={1} foregroundStyle="secondaryLabel">{row.detail}</Text> : null}
  <Text font={large ? 12 : 10} foregroundStyle={color(row)}>{row.unlimited ? '无限' : row.value === null ? '--' : Math.round(row.value)+'%'}</Text>
 </HStack>
}
async function main() {
 const kind:Kind = (Widget.parameter || '').trim().toLowerCase() === 'server' ? 'server' : 'ai'
 const result=await load(kind); const data=rows(kind,result.data); const large=Widget.family === 'systemLarge'
 const stamp=result.at ? new Date(result.at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : '--'
 const status=result.failed ? (result.at ? '离线缓存 '+stamp : '获取失败') : '获取 '+stamp
 Widget.present(<VStack alignment="leading" spacing={large ? 5 : 2} padding={10} widgetBackground={{light:'#F4F6FA',dark:'#111827'}}>
  <HStack><Text font={large ? 16 : 13} foregroundStyle="label">{kind === 'ai' ? 'AI 额度 · 剩余' : '节点流量 · 剩余'}</Text><Spacer/><Text font={9} foregroundStyle={result.failed ? 'systemOrange' : 'secondaryLabel'}>{status}</Text><Button title="↻" intent={Refresh(undefined)} buttonStyle="plain" /></HStack>
  {kind === 'ai' && !large ? <HStack alignment="top" spacing={12}><VStack alignment="leading" spacing={3}>{data.slice(0,5).map((row)=><Line key={row.name} row={row} large={false}/>)}</VStack><VStack alignment="leading" spacing={3}>{data.slice(5).map((row)=><Line key={row.name} row={row} large={false}/>)}</VStack></HStack> : <VStack alignment="leading" spacing={large ? 8 : 3}>{data.map((row)=><Line key={row.name} row={row} large={large}/>)}</VStack>}
  <Spacer/>
 </VStack>, {policy:'after',date:new Date(Date.now()+30*60*1000)})
 Script.exit()
}
void main()
