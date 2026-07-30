import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { colors, spacing, typography } from '@/constants/theme';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Paragraph({ children }: { children: string }) {
  return <Text style={styles.paragraph}>{children}</Text>;
}

function Bullet({ children }: { children: string }) {
  return <Text style={styles.bullet}>• {children}</Text>;
}

export default function PrivacyPolicyScreen() {
  return (
    <ScreenWrapper>
      <Text style={styles.title}>Política de privacidad</Text>
      <Text style={styles.updated}>Última actualización: 8 de julio de 2026</Text>

      <Paragraph>
        Esta política describe cómo Programaciones online (la plataforma web y aplicación de
        programaciones deportivas) trata los datos personales de atletas y entrenadores que utilizan
        el servicio.
      </Paragraph>

      <Section title="1. Responsable del tratamiento">
        <Paragraph>
          El responsable del tratamiento es el titular de la plataforma Programaciones online. Para
          cualquier consulta relacionada con privacidad puedes escribir a través del canal de
          contacto habilitado en la aplicación o a tu entrenador, que podrá derivar la solicitud al
          responsable del servicio.
        </Paragraph>
      </Section>

      <Section title="2. Datos que recopilamos">
        <Paragraph>Podemos tratar las siguientes categorías de datos:</Paragraph>
        <Bullet>Datos de cuenta: nombre, correo electrónico y credenciales de acceso.</Bullet>
        <Bullet>
          Datos de perfil deportivo: nivel, objetivo, altura, peso y limitaciones o lesiones que
          indiques voluntariamente.
        </Bullet>
        <Bullet>
          Datos de uso del servicio: programaciones activas, sesiones realizadas, partes completadas,
          sensaciones que registres y progreso asociado a tus entrenos.
        </Bullet>
        <Bullet>
          Planes asignados: contenido de planes personalizados o nutricionales creados por tu
          entrenador.
        </Bullet>
        <Bullet>
          Comunicaciones: mensajes intercambiados con tu entrenador dentro de la plataforma.
        </Bullet>
        <Bullet>
          Datos técnicos básicos necesarios para el funcionamiento seguro del servicio (por ejemplo,
          identificadores de sesión o registros de error).
        </Bullet>
      </Section>

      <Section title="3. Finalidad del tratamiento">
        <Paragraph>Utilizamos tus datos para:</Paragraph>
        <Bullet>Gestionar tu cuenta y permitirte acceder a la plataforma.</Bullet>
        <Bullet>Mostrarte las programaciones y planes que tienes asignados.</Bullet>
        <Bullet>Registrar tu actividad de entrenamiento y compartirla con tu entrenador.</Bullet>
        <Bullet>Facilitar la comunicación entre atleta y entrenador.</Bullet>
        <Bullet>Mejorar la seguridad, el mantenimiento y el correcto funcionamiento del servicio.</Bullet>
        <Bullet>Cumplir obligaciones legales aplicables.</Bullet>
      </Section>

      <Section title="4. Base legal">
        <Paragraph>
          El tratamiento se basa en la ejecución del servicio solicitado, el consentimiento que
          prestas al registrarte y aceptar esta política, y el interés legítimo en operar y proteger
          la plataforma.
        </Paragraph>
      </Section>

      <Section title="5. Destinatarios y acceso">
        <Paragraph>
          Tus datos pueden ser accesibles por los entrenadores que te tengan asignados, con el fin de
          preparar y supervisar tu programación. También pueden ser tratados por proveedores
          tecnológicos que nos prestan servicios de alojamiento, base de datos, autenticación o
          infraestructura, siempre bajo obligaciones de confidencialidad y seguridad.
        </Paragraph>
        <Paragraph>No vendemos tus datos personales a terceros.</Paragraph>
      </Section>

      <Section title="6. Conservación">
        <Paragraph>
          Conservamos los datos mientras mantengas una cuenta activa o sea necesario para prestarte el
          servicio. Cuando dejes de usar la plataforma, podremos conservar determinada información
          durante los plazos exigidos por ley o mientras exista una obligación contractual o de
          reclamación.
        </Paragraph>
      </Section>

      <Section title="7. Seguridad">
        <Paragraph>
          Aplicamos medidas técnicas y organizativas razonables para proteger tus datos frente a
          accesos no autorizados, pérdida o alteración. No obstante, ningún sistema en Internet puede
          garantizar una seguridad absoluta.
        </Paragraph>
      </Section>

      <Section title="8. Tus derechos">
        <Paragraph>
          Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación del
          tratamiento y portabilidad, así como retirar tu consentimiento cuando este sea la base del
          tratamiento. También puedes presentar una reclamación ante la autoridad de protección de
          datos competente.
        </Paragraph>
        <Paragraph>
          Para ejercer estos derechos, contacta a través de los canales disponibles en la aplicación
          o con tu entrenador.
        </Paragraph>
      </Section>

      <Section title="9. Menores de edad">
        <Paragraph>
          El servicio no está dirigido a menores de edad sin autorización parental o tutela. Si
          detectamos datos de menores recopilados sin la base legal adecuada, procederemos a su
          eliminación.
        </Paragraph>
      </Section>

      <Section title="10. Cambios en esta política">
        <Paragraph>
          Podemos actualizar esta política para reflejar cambios legales o funcionales del servicio.
          Publicaremos la versión vigente en esta misma página dentro de la aplicación.
        </Paragraph>
      </Section>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  updated: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  paragraph: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  bullet: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.xs,
    paddingLeft: spacing.xs,
  },
});
