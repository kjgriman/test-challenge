import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart,
  Users,
  Gamepad2,
  Video,
  BarChart3,
  Award,
  CheckCircle,
  ArrowRight,
  Play,
  Star,
  MessageSquare,
  Shield,
  Zap,
  Sparkles,
  Target,
  Clock,
  Globe
} from 'lucide-react';

// Importar componentes de shadcn/ui
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Componente principal de Landing
const Landing: React.FC = () => {
  // Características principales de la plataforma
  const features = [
    {
      icon: Video,
      title: 'Terapia Virtual',
      description: 'Sesiones de terapia del habla en tiempo real desde cualquier lugar',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Gamepad2,
      title: 'Juegos Interactivos',
      description: 'Actividades educativas y divertidas para mejorar la comunicación',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: BarChart3,
      title: 'Seguimiento del Progreso',
      description: 'Monitoreo detallado del avance y resultados de cada estudiante',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: Users,
      title: 'Gestión de Caseload',
      description: 'Administración completa de estudiantes y sesiones de terapia',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  // Beneficios de la plataforma
  const benefits = [
    'Acceso desde cualquier dispositivo',
    'Sesiones en tiempo real con video',
    'Juegos educativos personalizados',
    'Reportes detallados de progreso',
    'Comunicación segura y privada',
    'Soporte técnico 24/7',
  ];

  // Testimonios (mock)
  const testimonials = [
    {
      name: 'Dra. María González',
      role: 'Terapeuta del Habla',
      content: 'Esta plataforma ha revolucionado mi práctica. Los juegos interactivos mantienen a mis estudiantes comprometidos y motivados.',
      rating: 5,
    },
    {
      name: 'Carlos Rodríguez',
      role: 'Padre de Estudiante',
      content: 'Mi hijo ha mejorado significativamente su pronunciación gracias a las sesiones virtuales y los juegos divertidos.',
      rating: 5,
    },
    {
      name: 'Ana Martínez',
      role: 'Directora de Clínica',
      content: 'La plataforma nos permite atender a más estudiantes de manera eficiente sin comprometer la calidad del servicio.',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Terapia del Habla
              </span>
            </Link>

            {/* Navegación */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Características
              </a>
              <a href="#benefits" className="text-muted-foreground hover:text-foreground transition-colors">
                Beneficios
              </a>
              <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">
                Testimonios
              </a>
            </nav>

            {/* Botones de acción */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link to="/login">Iniciar Sesión</Link>
              </Button>
              <Button asChild>
                <Link to="/login">Comenzar Gratis</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-background to-purple-50" />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="secondary" className="mb-4">
              <Sparkles className="w-4 h-4 mr-2" />
              Plataforma Innovadora
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Terapia del Habla
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Virtual e Interactiva
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Conecta terapeutas y estudiantes en una plataforma innovadora que combina 
              sesiones virtuales con juegos educativos para maximizar el progreso.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button size="lg" asChild>
                <Link to="/login">
                  Comenzar Ahora
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline">
                <Play className="mr-2 w-4 h-4" />
                Ver Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Características Principales
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Nuestra plataforma combina tecnología avanzada con metodologías probadas 
              para ofrecer la mejor experiencia de terapia virtual.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                      <feature.icon className={`w-8 h-8 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
                ¿Por qué elegir nuestra plataforma?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Ofrecemos una solución completa que combina la conveniencia de la terapia 
                virtual con la efectividad de las sesiones presenciales tradicionales.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center space-x-3"
                  >
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="shadow-2xl">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">Plataforma Inteligente</CardTitle>
                  <CardDescription className="text-base">
                    Tecnología de vanguardia para una experiencia excepcional
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-foreground">Tiempo de respuesta</span>
                    <Badge variant="secondary">≤ 50ms</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-foreground">Uptime garantizado</span>
                    <Badge variant="secondary">99.9%</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-foreground">Encriptación</span>
                    <Badge variant="secondary">AES-256</Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Lo que dicen nuestros usuarios
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Descubre cómo nuestra plataforma está transformando la terapia del habla 
              para terapeutas y estudiantes alrededor del mundo.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <CardDescription className="text-base italic">
                      "{testimonial.content}"
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              ¿Listo para comenzar?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Únete a cientos de terapeutas y estudiantes que ya están 
              transformando la terapia del habla con nuestra plataforma.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/login">
                  Comenzar Gratis
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                Contactar Ventas
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="ml-3 text-xl font-bold">Terapia del Habla</span>
              </div>
              <p className="text-muted-foreground">
                Plataforma virtual innovadora para terapia del habla que conecta 
                terapeutas y estudiantes en tiempo real.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Plataforma</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Características</a></li>
                <li><a href="#benefits" className="hover:text-foreground transition-colors">Beneficios</a></li>
                <li><a href="#testimonials" className="hover:text-foreground transition-colors">Testimonios</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Soporte</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="/help" className="hover:text-foreground transition-colors">Centro de Ayuda</a></li>
                <li><a href="/contact" className="hover:text-foreground transition-colors">Contacto</a></li>
                <li><a href="/docs" className="hover:text-foreground transition-colors">Documentación</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="/privacy" className="hover:text-foreground transition-colors">Privacidad</a></li>
                <li><a href="/terms" className="hover:text-foreground transition-colors">Términos</a></li>
                <li><a href="/security" className="hover:text-foreground transition-colors">Seguridad</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center">
            <p className="text-muted-foreground">
              © 2024 Terapia del Habla. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;


