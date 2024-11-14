import { getClient } from '../services/client'
import { getConfig } from '../services/config'
import { Incoming } from '../services/incoming'
import { Listener } from '../services/listener'
import { isSessionStatusOnline } from '../services/session_store'
import { OnNewLogin } from '../services/socket'
import { Reload } from './reload'

export class ReloadBaileys extends Reload {
  private getClient: getClient
  private getConfig: getConfig
  private listener: Listener
  private incoming: Incoming
  private onNewLogin: OnNewLogin

  constructor(getClient: getClient, getConfig: getConfig, listener: Listener, incoming: Incoming, onNewLogin: OnNewLogin) {
    super()
    this.getClient = getClient
    this.getConfig = getConfig
    this.listener = listener
    this.incoming = incoming
    this.onNewLogin = onNewLogin
  }

  async run(phone: string) {
    const currentClient = await this.getClient({
      phone,
      incoming: this.incoming,
      listener: this.listener,
      getConfig: this.getConfig,
      onNewLogin: this.onNewLogin,
    })
    if (await isSessionStatusOnline(phone)) {
      await currentClient.disconnect()
    }
    await super.run(phone)
    const newClient = await this.getClient({
      phone,
      incoming: this.incoming,
      listener: this.listener,
      getConfig: this.getConfig,
      onNewLogin: this.onNewLogin,
    })
    await newClient.connect(1)
  }
}