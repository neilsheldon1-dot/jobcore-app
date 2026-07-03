import React from 'react'
import { NextResponse } from 'next/server'
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  pdf,
} from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingLeft: 36,
    paddingRight: 36,
    paddingBottom: 70,
    fontSize: 10,
    color: '#1e293b',
  },
  brand: {
    fontSize: 11,
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 18,
    textTransform: 'uppercase',
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    marginBottom: 18,
  },
  jobPanel: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#f8fafc',
    padding: 14,
    marginBottom: 22,
  },
  summaryPanel: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 14,
    marginBottom: 18,
  },
  panelHeading: {
    fontSize: 10,
    fontWeight: 700,
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  label: {
    fontSize: 8,
    color: '#64748b',
    marginTop: 8,
  },
  value: {
    fontSize: 10,
  },
  section: {
    marginBottom: 16,
  },
  heading: {
    fontSize: 12,
    fontWeight: 700,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  intro: {
    fontSize: 9,
    color: '#64748b',
    marginBottom: 12,
  },
  text: {
    lineHeight: 1.6,
  },
  photoWrap: {
    marginBottom: 22,
  },
  photo: {
    width: '100%',
    height: 260,
    objectFit: 'contain',
  },
  caption: {
    fontSize: 8,
    color: '#64748b',
    marginTop: 4,
  },
  footer: {
    position: 'absolute',
    left: 36,
    right: 36,
    bottom: 30,
    borderTopWidth: 1,
    borderTopColor: '#d1d5db',
    paddingTop: 8,
    fontSize: 8,
    color: '#64748b',
  },
  footerRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
})

function CompletionPdf({ document }: { document: any }) {
  const groupedPhotos = (document.photos || []).reduce(
    (groups: Record<string, any[]>, photo: any) => {
      const group = photo.photo_group || 'Photos'

      if (!groups[group]) {
        groups[group] = []
      }

      groups[group].push(photo)

      return groups
    },
    {}
  )

  const photoElements =
    document.photos?.length > 0
      ? [
          React.createElement(
            View,
            { key: 'photos', style: styles.section },

            React.createElement(Text, { style: styles.heading }, 'Photos'),

            React.createElement(
              Text,
              { style: styles.intro },
              'The following photos support the completed works described above.'
            ),

            ...Object.entries(groupedPhotos).flatMap(
              ([groupName, photos]: [string, any[]]) => [
                React.createElement(
                  Text,
                  {
                    key: `${groupName}-heading`,
                    style: {
                      fontSize: 10,
                      fontWeight: 700,
                      marginTop: 12,
                      marginBottom: 8,
                    },
                  },
                  groupName
                ),

                ...photos.map((photo: any, index: number) =>
                  React.createElement(
                    View,
                    {
                      key: `${groupName}-${index}`,
                      style: styles.photoWrap,
                    },

                    React.createElement(Image, {
                      src: photo.url,
                      style: styles.photo,
                    }),

                    photo.category &&
                      React.createElement(
                        Text,
                        { style: styles.caption },
                        photo.category
                      )
                  )
                ),
              ]
            )
          ),
        ]
      : []

  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: 'A4', style: styles.page },

      React.createElement(Text, { style: styles.brand }, 'Rubber Roofs'),
      React.createElement(Text, { style: styles.title }, 'Completion Report'),

      React.createElement(View, { style: styles.divider }),

      React.createElement(
        View,
        { style: styles.jobPanel },

        React.createElement(Text, { style: styles.panelHeading }, 'Job Details'),

        React.createElement(Text, { style: styles.label }, 'Property'),
        React.createElement(
          Text,
          { style: styles.value },
          document.property?.address || 'No address added'
        ),

        React.createElement(Text, { style: styles.label }, 'Job Reference'),
        React.createElement(
          Text,
          { style: styles.value },
          document.property?.jobNumber || '—'
        ),

        document.property?.poNumber &&
          React.createElement(
            React.Fragment,
            null,
            React.createElement(Text, { style: styles.label }, 'Purchase Order'),
            React.createElement(
              Text,
              { style: styles.value },
              document.property.poNumber
            )
          )
      ),

      React.createElement(
        View,
        { style: styles.summaryPanel },
        React.createElement(Text, { style: styles.heading }, 'Summary of Works'),
        React.createElement(
          Text,
          { style: styles.text },
          document.summary || 'No completion summary added.'
        )
      ),

      ...photoElements,

      React.createElement(
        View,
        { style: styles.footer, fixed: true },
        React.createElement(
          View,
          { style: styles.footerRow },
          React.createElement(Text, null, 'Rubber Roofs'),
          React.createElement(
            Text,
            null,
            `Generated ${new Date().toLocaleDateString('en-GB')}`
          )
        )
      )
    )
  )
}

export async function POST(req: Request) {
  const document = await req.json()

  const pdfBuffer = await pdf(
    React.createElement(CompletionPdf, { document })
  ).toBuffer()

  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="completion-report.pdf"',
    },
  })
}