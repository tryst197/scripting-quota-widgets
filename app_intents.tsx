import { AppIntentManager, AppIntentProtocol, Widget } from 'scripting'
export const Refresh = AppIntentManager.register({
 name:'QuotaRefresh', protocol:AppIntentProtocol.AppIntent,
 perform: async (_: undefined) => { await Widget.reloadAll() }
})
