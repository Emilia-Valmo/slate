import simulateKey from '../simulate-key';

export default function(plugin, change) {
    return plugin.plugin.onKeyDown(simulateKey('mod+enter'), change, {});
}
