import { Reactor } from './Reactor'
import { HParams } from '@/model/Hyperparameters';

export default {
  reactor: new Reactor(),

  state: {
    hparams: HParams.empty()
  },

  setParams(hparams: HParams): void {
    this.state.hparams = hparams
  },

  getParams(): HParams {
    return this.state.hparams
  }
}
