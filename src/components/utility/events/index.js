const eventHandlers = {
}

export const EVENT_TYPES = {
    'API_UNAVAILABLE': 'api-unavailable',
}

export const subscribe = (eventType, handler) => {
    const handlers = eventHandlers[eventType] || [];
    if(!handlers.find(h => h === handler)) {
        handlers.push(handler);
    }

    eventHandlers[eventType] = handlers;
}

export const unsubscribe = (eventType, handler) => {
    let handlers = eventHandlers[eventType] || [];
    handlers = handlers.filter(h => h !== handler);
    eventHandlers[eventType] = handlers;
}

export const fireEvent = (eventType, event) => {
    (eventHandlers[eventType] || []).forEach(handler => handler(event));
}
