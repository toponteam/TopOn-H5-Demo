import React, { PureComponent } from 'react';

class Logger extends PureComponent {

  formatDateTime() {
    const dateTime = new Date()
    const date = dateTime.toLocaleDateString()
    const time = dateTime.toLocaleTimeString()
    return date + ' ' + time
  }

  isBoolean (val) {
    return Object.prototype.toString.call(val).slice(8, -1) === 'Boolean'
  }

  render() {
    const sourceData = this.props.sourceData || [];
    if (!sourceData.length) {
      <section class="logs-section">
        <header class="logs-header">
          <span>日志列表</span>
        </header>
      </section>
    }
    return (
      <section className="logs-section">
        <header className="logs-header">
          <span>日志列表</span>
        </header>
        <ul>
          {
            sourceData.length > 0 && sourceData.map((item, idx) => {
              const errors = item.errors || []
              const className = `logs-item logs-${item.type}`
              return (
                <li key={idx} className={className}>
                  { this.formatDateTime() } { item.label } : { this.isBoolean(item.output) ? item.output.toString() : item.output }
                  {
                    errors.length > 0 && (
                      <ul>
                        {
                          errors.map((child, k) => {
                            return (
                              <li key={k}> {JSON.stringify(child)} </li>
                            )
                          })
                        }
                      </ul>
                    )
                  }
                </li>
              )
            })
          }
        </ul>
      </section>
    )
  }
}

export default Logger;
