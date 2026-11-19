// ===== NEURAL NETWORK ANIMATION - Full Width with Mouse Interaction =====
(function() {
    const canvas = document.getElementById('neuralCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');

    let layers = [];
    let connections = [];
    let signals = [];
    let sparks = [];
    let animationId;
    let time = 0;
    let mouseX = -1000;
    let mouseY = -1000;
    let isMouseOver = false;
    
    // Color wave state
    let colorWave = {
        active: false,
        color: null,
        origin: { x: 0, y: 0 },
        radius: 0,
        maxRadius: 0,
        speed: 15,
        decay: 0.97
    };
    
    // Color palettes for interactions
    const hoverColors = {
        pulse: '#10b981',  // Emerald green
        glow: 'rgba(16, 185, 129, 0.4)'
    };
    
    const clickColors = {
        pulse: '#f59e0b',  // Amber/orange
        glow: 'rgba(245, 158, 11, 0.4)'
    };
    
    // Performance limits
    const MAX_SIGNALS = 10;
    const MAX_SPARKS = 50;
    const MAX_TRAIL_LENGTH = 8;

    // Network configuration: [input, hidden1, hidden2, hidden3, hidden4, output]
    const layerConfig = [4, 6, 8, 8, 6, 4];

    function resizeCanvas() {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        initNetwork();
    }

    function getThemeColors() {
        const style = getComputedStyle(document.documentElement);
        return {
            node: style.getPropertyValue('--neural-node').trim() || '#cbd5e1',
            line: style.getPropertyValue('--neural-line').trim() || '#e2e8f0',
            pulse: style.getPropertyValue('--neural-pulse').trim() || '#3b82f6',
            glow: style.getPropertyValue('--neural-glow').trim() || 'rgba(59, 130, 246, 0.3)'
        };
    }

    function initNetwork() {
        layers = [];
        connections = [];
        signals = [];
        sparks = [];

        const centerY = canvas.height / 2;
        const padding = 40;
        const networkWidth = canvas.width - padding * 2;
        const layerSpacing = networkWidth / (layerConfig.length - 1);

        // Create nodes for each layer - full width
        layerConfig.forEach((nodeCount, layerIndex) => {
            const layer = [];
            const x = padding + layerIndex * layerSpacing;
            const layerHeight = Math.min(canvas.height * 0.85, nodeCount * 50);
            const nodeSpacing = layerHeight / (nodeCount - 1 || 1);
            const startY = centerY - layerHeight / 2;

            for (let i = 0; i < nodeCount; i++) {
                const y = nodeCount === 1 ? centerY : startY + i * nodeSpacing;
                layer.push({
                    x: x,
                    y: y,
                    baseX: x,
                    baseY: y,
                    radius: layerIndex === 0 || layerIndex === layerConfig.length - 1 ? 5 : 4,
                    activation: 0,
                    pulsePhase: Math.random() * Math.PI * 2,
                    layer: layerIndex
                });
            }
            layers.push(layer);
        });

        // Create connections between adjacent layers
        for (let l = 0; l < layers.length - 1; l++) {
            const fromLayer = layers[l];
            const toLayer = layers[l + 1];

            fromLayer.forEach((fromNode) => {
                toLayer.forEach((toNode) => {
                    connections.push({
                        from: fromNode,
                        to: toNode,
                        weight: Math.random() * 0.5 + 0.3,
                        pulsePhase: Math.random() * Math.PI * 2,
                        highlight: 0,
                        activation: 0,
                        activeSignal: null,
                        flowPhase: Math.random() * Math.PI * 2
                    });
                });
            });
        }
    }

    function createSignal(startNode = null) {
        if (layers.length === 0) return;

        const inputLayer = layers[0];
        const node = startNode || inputLayer[Math.floor(Math.random() * inputLayer.length)];
        node.activation = 1;

        signals.push({
            currentLayer: startNode ? findNodeLayer(startNode) : 0,
            currentNode: node,
            targetNode: null,
            progress: 0,
            path: [node],
            active: true,
            speed: 0.02 + Math.random() * 0.015,
            trail: [],
            intensity: 1.0,
            size: 1.0 + Math.random() * 0.5,
            currentConnection: null
        });
    }

    function findNodeLayer(node) {
        for (let i = 0; i < layers.length; i++) {
            if (layers[i].includes(node)) return i;
        }
        return 0;
    }

    function createSpark(x, y, customColor = null) {
        // Limit total sparks for performance
        if (sparks.length >= MAX_SPARKS) {
            sparks = sparks.slice(Math.floor(MAX_SPARKS * 0.7)); // Remove oldest 30%
        }
        
        const count = 8 + Math.floor(Math.random() * 6);
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
            const speed = 2 + Math.random() * 3;
            sparks.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                decay: 0.02 + Math.random() * 0.02,
                color: customColor
            });
        }
    }
    
    function triggerColorWave(x, y, colorPalette) {
        colorWave = {
            active: true,
            color: colorPalette,
            origin: { x, y },
            radius: 0,
            maxRadius: Math.max(canvas.width, canvas.height) * 1.5,
            speed: 12,
            intensity: 1.0,
            decay: 0.985
        };
    }
    
    function getNodeColorEffect(node) {
        if (!colorWave.active) return null;
        
        const dist = Math.sqrt(
            Math.pow(node.x - colorWave.origin.x, 2) + 
            Math.pow(node.y - colorWave.origin.y, 2)
        );
        
        // Node is within the wave ring (wave has passed but effect lingers)
        const waveWidth = 80;
        const waveFront = colorWave.radius;
        const waveBack = Math.max(0, colorWave.radius - waveWidth);
        
        if (dist >= waveBack && dist <= waveFront) {
            // Calculate intensity based on position within wave
            const posInWave = (dist - waveBack) / waveWidth;
            const waveIntensity = Math.sin(posInWave * Math.PI) * colorWave.intensity;
            return {
                color: colorWave.color,
                intensity: waveIntensity
            };
        }
        
        return null;
    }
    
    function getConnectionColorEffect(conn) {
        if (!colorWave.active) return null;
        
        const midX = (conn.from.x + conn.to.x) / 2;
        const midY = (conn.from.y + conn.to.y) / 2;
        const dist = Math.sqrt(
            Math.pow(midX - colorWave.origin.x, 2) + 
            Math.pow(midY - colorWave.origin.y, 2)
        );
        
        const waveWidth = 100;
        const waveFront = colorWave.radius;
        const waveBack = Math.max(0, colorWave.radius - waveWidth);
        
        if (dist >= waveBack && dist <= waveFront) {
            const posInWave = (dist - waveBack) / waveWidth;
            const waveIntensity = Math.sin(posInWave * Math.PI) * colorWave.intensity;
            return {
                color: colorWave.color,
                intensity: waveIntensity
            };
        }
        
        return null;
    }

    function findNearestNode(x, y, maxDist = 80) {
        let nearest = null;
        let minDist = maxDist;

        layers.forEach(layer => {
            layer.forEach(node => {
                const dist = Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2);
                if (dist < minDist) {
                    minDist = dist;
                    nearest = node;
                }
            });
        });

        return nearest;
    }

    function updateNetwork() {
        time += 0.016;

        // Update color wave
        if (colorWave.active) {
            colorWave.radius += colorWave.speed;
            colorWave.intensity *= colorWave.decay;
            
            if (colorWave.radius > colorWave.maxRadius || colorWave.intensity < 0.01) {
                colorWave.active = false;
            }
        }

        // Update sparks (with performance limit enforcement)
        if (sparks.length > MAX_SPARKS) {
            sparks = sparks.slice(-MAX_SPARKS); // Keep only most recent
        }
        
        sparks = sparks.filter(spark => {
            spark.x += spark.vx;
            spark.y += spark.vy;
            spark.vx *= 0.96;
            spark.vy *= 0.96;
            spark.life -= spark.decay;
            return spark.life > 0;
        });

        // Node motion and mouse interaction
        layers.forEach((layer, layerIdx) => {
            layer.forEach((node, nodeIdx) => {
                // Subtle floating
                node.y = node.baseY + Math.sin(time * 0.6 + nodeIdx * 0.4 + layerIdx * 0.3) * 2;
                node.pulsePhase += 0.015;

                // Mouse proximity effect
                if (isMouseOver) {
                    const dx = mouseX - node.x;
                    const dy = mouseY - node.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 100) {
                        const push = (100 - dist) / 100 * 8;
                        node.y = node.baseY - (dy / dist) * push;

                        // Activate nearby nodes
                        if (dist < 50) {
                            node.activation = Math.max(node.activation, 0.5);
                        }
                    }
                }

                // Decay activation
                node.activation *= 0.94;
            });
        });

        // Reset connection activation tracking
        connections.forEach(conn => {
            conn.highlight *= 0.9;
            conn.activation *= 0.92;
            conn.activeSignal = null;
            conn.flowPhase += 0.01;

            if (isMouseOver) {
                const midX = (conn.from.x + conn.to.x) / 2;
                const midY = (conn.from.y + conn.to.y) / 2;
                const dist = Math.sqrt((mouseX - midX) ** 2 + (mouseY - midY) ** 2);

                if (dist < 60) {
                    conn.highlight = Math.max(conn.highlight, (60 - dist) / 60);
                }
            }
        });

        // Update signals
        signals.forEach(signal => {
            if (!signal.active) return;

            // Update signal intensity (decay over time)
            signal.intensity *= 0.998;
            signal.progress += signal.speed;

            // Find and track current connection
            if (signal.currentLayer < layers.length - 1 && signal.targetNode) {
                const from = signal.currentNode;
                const to = signal.targetNode;
                
                // Find the connection this signal is traveling along
                signal.currentConnection = connections.find(conn => 
                    conn.from === from && conn.to === to
                );
                
                if (signal.currentConnection) {
                    signal.currentConnection.activeSignal = signal;
                    signal.currentConnection.activation = Math.max(
                        signal.currentConnection.activation, 
                        0.6 * signal.intensity
                    );
                    
                    // Cascade activation to target node
                    to.activation = Math.max(to.activation, 0.3 * signal.intensity);
                }
            }

            // Update trail
            if (signal.currentLayer < layers.length - 1 && signal.targetNode) {
                const from = signal.currentNode;
                const to = signal.targetNode;
                const x = from.x + (to.x - from.x) * signal.progress;
                const y = from.y + (to.y - from.y) * signal.progress;
                
                signal.trail.push({ x, y, intensity: signal.intensity, life: 1.0 });
                
                // Limit trail length and update life
                if (signal.trail.length > MAX_TRAIL_LENGTH) {
                    signal.trail.shift();
                }
                
                signal.trail.forEach(point => {
                    point.life *= 0.92;
                });
                
                signal.trail = signal.trail.filter(point => point.life > 0.05);
            }

            if (signal.progress >= 1) {
                signal.progress = 0;
                signal.currentLayer++;
                signal.currentConnection = null;

                if (signal.currentLayer >= layers.length) {
                    signal.active = false;
                    return;
                }

                const nextLayer = layers[signal.currentLayer];
                signal.currentNode = signal.targetNode || nextLayer[Math.floor(Math.random() * nextLayer.length)];
                signal.currentNode.activation = 1;
                signal.path.push(signal.currentNode);

                if (signal.currentLayer < layers.length - 1) {
                    const futureLayer = layers[signal.currentLayer + 1];
                    signal.targetNode = futureLayer[Math.floor(Math.random() * futureLayer.length)];
                }
            }
        });

        signals = signals.filter(s => s.active && s.intensity > 0.1);

        // Create signals more frequently with bursts (respecting limits)
        if (Math.random() < 0.045 && signals.length < MAX_SIGNALS) {
            createSignal();
            
            // Occasional burst of signals (10% chance)
            if (Math.random() < 0.1 && signals.length < MAX_SIGNALS - 2) {
                const inputLayer = layers[0];
                if (inputLayer && inputLayer.length > 0) {
                    const burstNode = inputLayer[Math.floor(Math.random() * inputLayer.length)];
                    setTimeout(() => {
                        if (signals.length < MAX_SIGNALS) createSignal(burstNode);
                    }, 100 + Math.random() * 200);
                    setTimeout(() => {
                        if (signals.length < MAX_SIGNALS) createSignal(burstNode);
                    }, 200 + Math.random() * 300);
                }
            }
        }
    }

    function drawNetwork() {
        const colors = getThemeColors();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw connections with animated flow
        connections.forEach(conn => {
            const pulseIntensity = (Math.sin(conn.pulsePhase + time * 0.5) + 1) / 2 * 0.1;
            const hasActivation = conn.activation > 0.05 || conn.highlight > 0.1;
            const colorEffect = getConnectionColorEffect(conn);
            
            // Skip drawing very inactive connections for performance (unless highlighted or active)
            // Draw all highlighted/active connections, but randomly skip some inactive ones
            if (!hasActivation && !conn.activeSignal && !colorEffect) {
                // Draw approximately 40% of inactive connections for performance
                if (Math.random() > 0.4) return;
            }
            
            conn.pulsePhase += 0.008;

            // Base connection line
            ctx.beginPath();
            ctx.moveTo(conn.from.x, conn.from.y);
            ctx.lineTo(conn.to.x, conn.to.y);

            if (colorEffect && colorEffect.intensity > 0.1) {
                ctx.strokeStyle = colorEffect.color.pulse;
                ctx.globalAlpha = 0.2 + colorEffect.intensity * 0.5;
                ctx.lineWidth = 1 + colorEffect.intensity * 2;
            } else if (conn.highlight > 0.1) {
                ctx.strokeStyle = colors.pulse;
                ctx.globalAlpha = 0.1 + conn.highlight * 0.4;
                ctx.lineWidth = 1 + conn.highlight;
            } else {
                ctx.strokeStyle = colors.line;
                ctx.globalAlpha = 0.12 + pulseIntensity;
                ctx.lineWidth = 1;
            }
            ctx.stroke();
            
            // Draw animated flow for active connections
            if (conn.activeSignal && conn.activeSignal.active) {
                const signal = conn.activeSignal;
                const progress = signal.progress;
                const dx = conn.to.x - conn.from.x;
                const dy = conn.to.y - conn.from.y;
                const length = Math.sqrt(dx * dx + dy * dy);
                
                // Create animated gradient flow
                const gradientStart = Math.max(0, progress - 0.15);
                const gradientEnd = Math.min(1, progress + 0.15);
                
                if (gradientEnd > gradientStart) {
                    const grad = ctx.createLinearGradient(
                        conn.from.x + dx * gradientStart,
                        conn.from.y + dy * gradientStart,
                        conn.from.x + dx * gradientEnd,
                        conn.from.y + dy * gradientEnd
                    );
                    
                    const centerPos = (progress - gradientStart) / (gradientEnd - gradientStart);
                    const opacity = signal.intensity * 0.8;
                    
                    grad.addColorStop(0, `rgba(59, 130, 246, 0)`);
                    grad.addColorStop(Math.max(0, centerPos - 0.3), `rgba(59, 130, 246, ${opacity * 0.3})`);
                    grad.addColorStop(centerPos, `rgba(59, 130, 246, ${opacity})`);
                    grad.addColorStop(Math.min(1, centerPos + 0.3), `rgba(59, 130, 246, ${opacity * 0.3})`);
                    grad.addColorStop(1, `rgba(59, 130, 246, 0)`);
                    
                    ctx.beginPath();
                    ctx.moveTo(conn.from.x + dx * gradientStart, conn.from.y + dy * gradientStart);
                    ctx.lineTo(conn.from.x + dx * gradientEnd, conn.from.y + dy * gradientEnd);
                    ctx.strokeStyle = grad;
                    ctx.lineWidth = 2.5 * signal.size;
                    ctx.globalAlpha = 1;
                    ctx.stroke();
                }
            }
            
            // Draw activation glow
            if (conn.activation > 0.05) {
                ctx.beginPath();
                ctx.moveTo(conn.from.x, conn.from.y);
                ctx.lineTo(conn.to.x, conn.to.y);
                ctx.strokeStyle = colors.pulse;
                ctx.globalAlpha = conn.activation * 0.25;
                ctx.lineWidth = 1 + conn.activation * 1.5;
                ctx.stroke();
            }
        });

        // Draw signal paths with enhanced trails
        signals.forEach(signal => {
            if (signal.path.length < 2 && signal.trail.length === 0) return;

            // Draw completed path segments with fade
            for (let i = 0; i < signal.path.length - 1; i++) {
                const from = signal.path[i];
                const to = signal.path[i + 1];
                const segmentFade = Math.pow(0.85, signal.path.length - 1 - i);

                ctx.beginPath();
                ctx.moveTo(from.x, from.y);
                ctx.lineTo(to.x, to.y);
                ctx.strokeStyle = colors.pulse;
                ctx.globalAlpha = 0.25 * segmentFade * signal.intensity;
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }

            // Draw signal trail
            if (signal.trail.length > 1) {
                for (let i = 0; i < signal.trail.length - 1; i++) {
                    const point = signal.trail[i];
                    const nextPoint = signal.trail[i + 1];
                    const trailAlpha = point.life * point.intensity * 0.4;
                    
                    if (trailAlpha > 0.01) {
                        ctx.beginPath();
                        ctx.moveTo(point.x, point.y);
                        ctx.lineTo(nextPoint.x, nextPoint.y);
                        ctx.strokeStyle = colors.pulse;
                        ctx.globalAlpha = trailAlpha;
                        ctx.lineWidth = 1 + point.life * 2;
                        ctx.stroke();
                    }
                }
            }

            // Enhanced traveling signal dot with glow
            if (signal.currentLayer < layers.length - 1 && signal.targetNode) {
                const from = signal.currentNode;
                const to = signal.targetNode;
                const x = from.x + (to.x - from.x) * signal.progress;
                const y = from.y + (to.y - from.y) * signal.progress;
                const dotSize = 3 * signal.size;

                // Outer glow circles
                for (let i = 3; i >= 1; i--) {
                    ctx.beginPath();
                    ctx.arc(x, y, dotSize * (2 + i * 1.5), 0, Math.PI * 2);
                    ctx.fillStyle = colors.pulse;
                    ctx.globalAlpha = signal.intensity * (0.08 / i);
                    ctx.fill();
                }

                // Main signal dot
                ctx.beginPath();
                ctx.arc(x, y, dotSize * 1.5, 0, Math.PI * 2);
                ctx.fillStyle = colors.pulse;
                ctx.globalAlpha = signal.intensity * 0.4;
                ctx.fill();

                ctx.beginPath();
                ctx.arc(x, y, dotSize, 0, Math.PI * 2);
                ctx.fillStyle = colors.pulse;
                ctx.globalAlpha = signal.intensity * 0.95;
                ctx.fill();
                
                // Core dot
                ctx.beginPath();
                ctx.arc(x, y, dotSize * 0.5, 0, Math.PI * 2);
                ctx.fillStyle = '#ffffff';
                ctx.globalAlpha = signal.intensity * 0.8;
                ctx.fill();
            }
        });

        // Draw sparks
        sparks.forEach(spark => {
            ctx.beginPath();
            ctx.arc(spark.x, spark.y, 2 * spark.life, 0, Math.PI * 2);
            ctx.fillStyle = spark.color ? spark.color.pulse : colors.pulse;
            ctx.globalAlpha = spark.life * 0.8;
            ctx.fill();
        });

        // Draw nodes
        layers.forEach(layer => {
            layer.forEach(node => {
                const isActive = node.activation > 0.1;
                const pulseScale = 1 + Math.sin(node.pulsePhase) * 0.08;
                const colorEffect = getNodeColorEffect(node);
                const hasColorEffect = colorEffect && colorEffect.intensity > 0.1;
                
                // Determine node color
                let nodeColor = isActive ? colors.pulse : colors.node;
                if (hasColorEffect) {
                    nodeColor = colorEffect.color.pulse;
                }

                if (isActive || hasColorEffect) {
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, node.radius * 2.5, 0, Math.PI * 2);
                    ctx.fillStyle = hasColorEffect ? colorEffect.color.pulse : colors.pulse;
                    ctx.globalAlpha = (hasColorEffect ? colorEffect.intensity : node.activation) * 0.3;
                    ctx.fill();
                }

                ctx.beginPath();
                ctx.arc(node.x, node.y, node.radius * pulseScale * 1.4, 0, Math.PI * 2);
                ctx.fillStyle = nodeColor;
                ctx.globalAlpha = (isActive || hasColorEffect) ? 0.25 + (hasColorEffect ? colorEffect.intensity * 0.2 : 0) : 0.12;
                ctx.fill();

                ctx.beginPath();
                ctx.arc(node.x, node.y, node.radius * pulseScale, 0, Math.PI * 2);
                ctx.fillStyle = nodeColor;
                ctx.globalAlpha = (isActive || hasColorEffect) ? 0.85 : 0.4;
                ctx.fill();
            });
        });

        ctx.globalAlpha = 1;
    }

    function animate() {
        updateNetwork();
        drawNetwork();
        animationId = requestAnimationFrame(animate);
    }

    // Mouse interaction
    let lastHoverWaveTime = 0;
    const HOVER_WAVE_COOLDOWN = 1500; // ms between hover waves
    
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
        isMouseOver = true;
    });
    
    canvas.addEventListener('mouseenter', (e) => {
        const now = Date.now();
        if (now - lastHoverWaveTime > HOVER_WAVE_COOLDOWN) {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            triggerColorWave(x, y, hoverColors);
            lastHoverWaveTime = now;
        }
    });

    canvas.addEventListener('mouseleave', () => {
        isMouseOver = false;
        mouseX = -1000;
        mouseY = -1000;
    });

    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Trigger click color wave (amber/orange)
        triggerColorWave(x, y, clickColors);
        createSpark(x, y, clickColors);

        const nearestNode = findNearestNode(x, y, 100);
        if (nearestNode) {
            nearestNode.activation = 1;
            createSignal(nearestNode);

            // Activate connected nodes too
            connections.forEach(conn => {
                if (conn.from === nearestNode || conn.to === nearestNode) {
                    conn.highlight = 1;
                }
            });
        }
    });

    // Handle resize
    window.addEventListener('resize', resizeCanvas);

    // Initialize
    resizeCanvas();
    animate();

    // Start with signals
    setTimeout(() => createSignal(), 300);
    setTimeout(() => createSignal(), 800);
    setTimeout(() => createSignal(), 1300);

    // Pause when not visible
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(animationId);
        } else {
            animate();
        }
    });
})();
