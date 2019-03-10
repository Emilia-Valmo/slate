export default function(plugin, change) {
  return plugin.changes.removeRow(change, { at: 1 })
}
