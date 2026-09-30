import { ItemFinance } from "@/src/context/FinanceContext";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface NewItemFinance {
  title: string | null;
  value: number;
  tag: string;
}

interface WalletCardProps {
  title: string;
  total: number;
  items: ItemFinance[];
  hidden: boolean;
  styles: any;
  type: "earn" | "investments" | "lost";
  onToggle: () => void;
  button: React.ReactNode;
  modal: boolean;
  setModal: (value: boolean) => void;
  onAddItem: (item: NewItemFinance) => void;
  onAddTag: (tag: string) => void;
}

export default function WalletCard({
  title,
  total,
  items,
  type,
  hidden,
  styles,
}: WalletCardProps) {
  const [expandedTag, setExpandedTag] = useState<string | null>(null);

  const investmentsEstimate =
    type === "investments"
      ? items.reduce(
          (acc, item) => acc + (item.rate ? item.value * (item.rate / 100) : 0),
          0,
        )
      : 0;

  const groupedItems = items.reduce(
    (acc, item) => {
      const tagName = item.tag || "Geral";

      if (!acc[tagName]) {
        acc[tagName] = {
          items: [],
          total: 0,
        };
      }

      acc[tagName].items.push(item);
      acc[tagName].total += item.value;

      return acc;
    },
    {} as Record<string, { items: ItemFinance[]; total: number }>,
  );

  const toggleTag = (tagName: string) => {
    setExpandedTag((prev) => (prev === tagName ? null : tagName));
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        {type === "investments" && !hidden && (
          <Text style={[styles.itemText, { fontSize: 12, marginTop: 4 }]}>
            R$+
            {investmentsEstimate.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </Text>
        )}
        <Text style={styles.cardValue}>
          {hidden
            ? "R$ •••••"
            : `R$ ${type === "lost" ? "-" : ""}${total.toLocaleString(
                "pt-BR",
                {
                  minimumFractionDigits: 2,
                },
              )}`}
        </Text>
      </View>

      {!hidden &&
        Object.entries(groupedItems).map(([tag, data]) => {
          const isExpanded = expandedTag === tag;

          return (
            <View key={tag} style={localStyles.tagContainer}>
              <TouchableOpacity
                style={styles.item}
                onPress={() => toggleTag(tag)}
                activeOpacity={0.7}
              >
                <Text style={[styles.itemText, localStyles.tagTitle]}>
                  {isExpanded ? "▲" : "▼"} #{tag}
                </Text>

                <Text style={styles.itemValue}>
                  R$ {type === "investments" ? "" : ""}
                  {data.total.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}{" "}
                </Text>
              </TouchableOpacity>

              {isExpanded && (
                <View style={localStyles.subItemsContainer}>
                  {data.items.map((subItem) => (
                    <View key={subItem.id} style={styles.item}>
                      <Text style={[styles.itemText, localStyles.subItemText]}>
                        • {subItem.title}
                      </Text>

                      <Text style={styles.itemValue}>
                        R${" "}
                        {subItem.value.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}
    </View>
  );
}

const localStyles = StyleSheet.create({
  tagContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(150, 150, 150, 0.15)",
    paddingVertical: 4,
  },

  tagTitle: {
    fontWeight: "800",
  },

  subItemsContainer: {
    paddingLeft: 14,
    paddingVertical: 4,
    opacity: 0.85,
  },

  subItemText: {
    fontSize: 13,
  },
});
