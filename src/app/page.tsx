import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-b from-background to-secondary">
      <div className="max-w-4xl w-full space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            ENGEAR
          </h1>
          <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
            Gestão Comercial
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Sistema completo de controle de vendas e gestão da equipe comercial ENGEAR
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="lg" className="w-full sm:w-auto">
            Acessar Sistema
          </Button>
          <Button size="lg" variant="outline" className="w-full sm:w-auto">
            Documentação
          </Button>
        </div>

        <div className="pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Powered by Next.js 14 + Firebase + TypeScript
          </p>
        </div>
      </div>
    </main>
  )
}
